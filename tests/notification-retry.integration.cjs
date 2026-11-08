const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { mkdtemp, rm } = require("node:fs/promises");
const net = require("node:net");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { before, after, test } = require("node:test");
const { QueueEvents, Worker } = require("bullmq");

let redis;
let directory;
let queue;
let events;
let worker;
const attempts = new Map();

before(async () => {
  const socket = net.createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  await new Promise((resolve, reject) => socket.close((error) => error ? reject(error) : resolve()));
  directory = await mkdtemp(path.join(tmpdir(), "notification-retry-"));
  redis = spawn("redis-server", [
    "--bind", "127.0.0.1", "--port", String(port),
    "--save", "", "--appendonly", "no", "--dir", directory,
  ]);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Test Redis did not start")), 5000);
    const fail = (error) => { clearTimeout(timeout); reject(error); };
    redis.once("error", fail);
    redis.once("exit", (code) => fail(new Error(`Test Redis exited with code ${code}`)));
    let output = "";
    redis.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (output.includes("Ready to accept connections")) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });

  // Point the production queue at an isolated Redis before importing it.
  const { connection } = require("../src/queue");
  connection.port = port;
  queue = require("../src/jobs/notification.job").notificationQueue;
  events = new QueueEvents("notifications", { connection });
  worker = new Worker("notifications", async (job) => {
    const count = (attempts.get(job.id) || 0) + 1;
    attempts.set(job.id, count);
    if (count <= job.data.failures) throw new Error("Temporary SMTP failure");
    return "delivered";
  }, { connection });
  await Promise.all([queue.waitUntilReady(), events.waitUntilReady(), worker.waitUntilReady()]);
});

after(async () => {
  if (worker) await worker.close();
  if (events) await events.close();
  if (queue) await queue.close();
  if (redis && redis.exitCode === null && redis.pid) {
    const stopped = once(redis, "exit");
    redis.kill("SIGTERM");
    await stopped;
  }
  if (directory) await rm(directory, { recursive: true, force: true });
});

test("delivers a notification after transient delivery failures", async () => {
  const job = await queue.add("send", { failures: 2 });
  assert.equal(await job.waitUntilFinished(events, 10000), "delivered");
  assert.equal(attempts.get(job.id), 3);
});

test("the production queue handles connection error events", () => {
  assert.ok(queue.listenerCount("error") > 0);
  assert.doesNotThrow(() => queue.emit("error", new Error("Redis unavailable")));
});

test("stops retrying a persistent failure after three attempts", async () => {
  const job = await queue.add("send", { failures: 10 });
  await assert.rejects(job.waitUntilFinished(events, 10000), /Temporary SMTP failure/);
  assert.equal(attempts.get(job.id), 3);
  assert.equal(await job.getState(), "failed");
});

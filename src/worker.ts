import "dotenv/config";
import { Worker } from "bullmq";
import { connection } from "./queue";
import { sendEmail } from "./services/email.service";

const worker = new Worker(
  "notifications",
  async (job) => {
    const { to, subject, message } = job.data;

    await sendEmail(
      to,
      subject,
      message
    );

    console.log(
      `Email sent to ${to}`
    );
  },
  { connection }
);

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  try {
    await worker.close();
  } catch (error) {
    console.error("Could not close notification worker:", error);
    process.exitCode = 1;
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log("Worker started...");

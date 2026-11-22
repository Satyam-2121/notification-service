import "dotenv/config";
import { UnrecoverableError, Worker } from "bullmq";
import { connection } from "./queue";
import { sendEmail } from "./services/email.service";

const worker = new Worker(
  "notifications",
  async (job) => {
    const { to, subject, message } = job.data;

    try {
      await sendEmail(to, subject, message);
    } catch (error) {
      if (
        error instanceof Error &&
        "responseCode" in error &&
        typeof error.responseCode === "number" &&
        error.responseCode >= 500 &&
        error.responseCode < 600
      ) {
        throw new UnrecoverableError(error.message);
      }
      throw error;
    }

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

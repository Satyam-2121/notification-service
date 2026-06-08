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

console.log("Worker started...");
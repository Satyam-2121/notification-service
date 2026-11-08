import { Queue } from "bullmq";
import { connection } from "../queue";

export const notificationQueue = new Queue("notifications", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

// Queue connection errors are emitted independently of individual jobs.
notificationQueue.on("error", (error) => {
  console.error("Notification queue connection error:", error.message);
});

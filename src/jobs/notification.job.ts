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

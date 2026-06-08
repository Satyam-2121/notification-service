import { Queue } from "bullmq";
import { connection } from "../queue";

export const notificationQueue = new Queue("notifications", {
  connection,
});
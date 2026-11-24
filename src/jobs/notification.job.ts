import { Queue } from "bullmq";
import { connection } from "../queue";
import type { NotificationInput } from "../schemas/notification.schema";

export const notificationQueue = new Queue("notifications", {
  connection: {
    ...connection,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  },
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

let initialized = false;
void notificationQueue.waitUntilReady().then(
  () => {
    initialized = true;
  },
  (error) => {
    console.error("Notification queue initialization failed:", error.message);
  },
);

export async function enqueueNotification(notification: NotificationInput) {
  if (!initialized) {
    throw new Error("Notification queue is not ready");
  }
  return notificationQueue.add("send", notification);
}

export async function isNotificationQueueReady() {
  if (!initialized) return false;

  const client = await notificationQueue.client;
  return client.status === "ready";
}

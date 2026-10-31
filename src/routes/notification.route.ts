import { Router } from "express";
import { NotificationSchema } from "../schemas/notification.schema";
import { notificationQueue } from "../jobs/notification.job";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = NotificationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.flatten(),
    });
  }

  try {
    await notificationQueue.add(
      "send",
      parsed.data
    );
  } catch (error) {
    console.error("Failed to queue notification:", error);
    return res.status(503).json({
      error: "Notification service temporarily unavailable",
    });
  }

  return res.status(202).json({
    status: "queued",
  });
});

export default router;

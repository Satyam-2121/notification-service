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

  await notificationQueue.add(
    "send",
    parsed.data
  );

  return res.status(202).json({
    status: "queued",
  });
});

export default router;
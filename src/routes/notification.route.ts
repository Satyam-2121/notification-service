import { Router } from "express";
import { NotificationSchema } from "../schemas/notification.schema";
import { enqueueNotification } from "../jobs/notification.job";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = NotificationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.flatten(),
    });
  }

  try {
    const job = await enqueueNotification(parsed.data);
    return res.status(202).json({
      status: "queued",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Failed to queue notification:", error);
    return res.status(503).json({
      error: "Notification service temporarily unavailable",
    });
  }
});

export default router;

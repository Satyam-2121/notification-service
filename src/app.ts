import express from "express";
import { isNotificationQueueReady } from "./jobs/notification.job";
import notificationRoutes from "./routes/notification.route";

const app = express();

app.use(express.json());

app.use("/notify", notificationRoutes);

app.get("/ready", async (_req, res) => {
  const ready = await isNotificationQueueReady();
  res.set("Cache-Control", "no-store");
  return res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "unavailable" });
});

app.get("/", (req, res) => {
    res.send("Notification Service Running 🚀");
  });
  
const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

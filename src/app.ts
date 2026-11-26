import express, { type ErrorRequestHandler } from "express";
import { isNotificationQueueReady } from "./jobs/notification.job";
import notificationRoutes from "./routes/notification.route";

const app = express();

app.use(express.json());

const handleJsonErrors: ErrorRequestHandler = (error, _req, res, next) => {
  if (error.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON request body" });
  } else if (error.type === "entity.too.large") {
    res.status(413).json({ error: "Request body is too large" });
  } else {
    next(error);
  }
};

app.use(handleJsonErrors);

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

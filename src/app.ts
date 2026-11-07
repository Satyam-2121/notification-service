import express from "express";
import notificationRoutes from "./routes/notification.route";

const app = express();

app.use(express.json());

app.use("/notify", notificationRoutes);

app.get("/", (req, res) => {
    res.send("Notification Service Running 🚀");
  });
  
const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

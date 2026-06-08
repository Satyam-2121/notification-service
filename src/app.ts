import express from "express";
import notificationRoutes from "./routes/notification.route";

const app = express();

app.use(express.json());

app.use("/notify", notificationRoutes);

app.get("/", (req, res) => {
    res.send("Notification Service Running 🚀");
  });
  
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
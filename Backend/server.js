import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import faceRoutes from "./routes/faceDataRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";
import generalRoutes from "./routes/generalRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/election", electionRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/face", faceRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/general", generalRoutes);
app.use("/api/notification", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Vote App Backend!");
})

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from "express";
import { config } from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";

config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/election", electionRoutes);
app.use("/api/candidate", candidateRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

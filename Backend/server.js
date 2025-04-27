import express from "express";
import { config } from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

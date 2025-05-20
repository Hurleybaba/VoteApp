import express from "express";

import {
  setFaceData,
  getFaceData,
} from "../controllers/faceDataControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/userid", verifyToken, setFaceData);
router.get("/:userid", verifyToken, getFaceData);

export default router;

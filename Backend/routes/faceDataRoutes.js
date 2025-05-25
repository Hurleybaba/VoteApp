import express from "express";

import {
  setFaceData,
  getFaceData,
  setAcademicData,
  getAcademicData,
} from "../controllers/faceDataControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/:userid", verifyToken, setFaceData);
router.get("/:userid", verifyToken, getFaceData);
router.post("/saa/:userid", verifyToken, setAcademicData);
router.get("/saa/:userid", verifyToken, getAcademicData);

export default router;

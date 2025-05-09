import express from "express";

import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getCandidates,
  getSingleCandidate,
} from "../controllers/candidateController.js";

const router = express.Router();

router.get("/", verifyToken, getCandidates);
router.get("/:candidateId", verifyToken, getSingleCandidate);

export default router;

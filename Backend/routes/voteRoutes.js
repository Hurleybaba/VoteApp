import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getAllVotes,
  voteForCandidate,
} from "../controllers/voteControllers.js";

const router = express.Router();

router.post("/vote/:candidateid", voteForCandidate);

router.get("/", verifyToken, getAllVotes);

export default router;

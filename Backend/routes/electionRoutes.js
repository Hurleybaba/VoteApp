import express from "express";

import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createElection,
  getPosts,
  getSinglePost,
  updateElectionStatus,
  getUpcomingElections,
} from "../controllers/electionController.js";

const router = express.Router();

router.get("/", verifyToken, getPosts);
router.get("/:electionId", verifyToken, getSinglePost);
router.put("/:electionId/status", verifyToken, updateElectionStatus);
router.post("/create", verifyToken, createElection);

router.get("/upcoming/:facultyId", verifyToken, getUpcomingElections);

export default router;

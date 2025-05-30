import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getAllVotes,
  voteForCandidate,
  recordVote,
  checkVoteStatus,
  getVoteDetails,
  sendVoteReceipt,
} from "../controllers/voteControllers.js";

const router = express.Router();

router.post("/vote/:candidateid", voteForCandidate);

router.get("/", verifyToken, getAllVotes);

router.post("/record-vote/:electionId/:candidateId", verifyToken, recordVote);

router.get("/check-status/:electionId", verifyToken, checkVoteStatus);

router.get("/get-vote-details/:electionId", verifyToken, getVoteDetails);

router.get("/send-receipt/:electionId", verifyToken, sendVoteReceipt);
export default router;

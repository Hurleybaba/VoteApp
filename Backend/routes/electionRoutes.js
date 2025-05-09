import express from "express";

import { verifyToken } from "../middlewares/verifyToken.js";
import { getPosts, getSinglePost } from "../controllers/electionController.js";

const router = express.Router();

router.get("/", verifyToken, getPosts);
router.get("/:postId", verifyToken, getSinglePost);

export default router;

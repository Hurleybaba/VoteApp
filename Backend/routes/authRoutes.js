import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getUser,
} from "../middlewares/authControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/user", verifyToken, getUser);
router.get("/news", verifyToken, getUser);

export default router;

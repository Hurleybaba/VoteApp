import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getUser,
  sendOTP,
  verifyOTP,
} from "../controllers/authControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/sendOTP", sendOTP);
router.post("/verifyOTP", verifyOTP);
router.get("/user", verifyToken, getUser);

export default router;

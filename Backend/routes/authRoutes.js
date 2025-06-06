import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getUser,
  sendEmail,
  verifyOtp,
  forgetPassword,
  resetPassword,
} from "../controllers/authControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkBlacklistToken } from "../middlewares/checkBlacklistToken.js";
import { checkUserEmail } from "../middlewares/checkUserEmail.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", checkBlacklistToken, verifyToken, logoutUser);
router.post("/verifyOtp", verifyOtp);
router.post("/sendEmail", sendEmail);
router.get("/user", verifyToken, getUser);
router.post("/forgot-password", checkUserEmail, forgetPassword);
router.post("/resetPassword", resetPassword);

export default router;

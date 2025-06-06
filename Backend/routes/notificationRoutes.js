import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  sendElectionNotification,
  sendStatusChangeNotification,
  registerDevice,
} from "../controllers/notificationControllers.js";

const router = express.Router();

router.post(
  "/send-election-notification",
  verifyToken,
  sendElectionNotification
);
router.post(
  "/send-status-notification",
  verifyToken,
  sendStatusChangeNotification
);
router.post("/register-device", verifyToken, registerDevice);

export default router;

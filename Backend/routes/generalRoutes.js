import express from "express";

import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getMenu,
  getHome,
  uploadProfilePicture,
  getVerifiedUsers,
} from "../controllers/generalController.js";
import upload from "../middlewares/multer.js";
const router = express.Router();

router.get("/home", verifyToken, getHome);
router.get("/menu", verifyToken, getMenu);
router.get("/verified-users", verifyToken, getVerifiedUsers);
router.post(
  "/upload",
  verifyToken,
  upload.single("profile_picture"),
  uploadProfilePicture
);

export default router;

import express from express;

import {verifyToken} from "../middlewares/verifyToken.js";
import { getMenu, getHome } from "../controllers/generalController.js";

const router = express.Router();

router.get("/home", verifyToken, getHome);
router.get("/menu", verifyToken, getMenu);
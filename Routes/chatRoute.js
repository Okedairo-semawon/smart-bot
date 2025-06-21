import express from "express";
const router = express.Router();
import {handleChat} from "../Controllers/chatController.js";

router.post ('/', handleChat);
export default router;
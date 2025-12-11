import express from "express";
import { isFirstTimeUser,setupUserProfile, updateUserProfile } from "../controllers/user.controller.js";

const router = express.Router();
router.get("/isFirstTimeUser", isFirstTimeUser);
router.post("/setupUserProfile", setupUserProfile);
router.post("/updateUserProfile", updateUserProfile);
export default router;

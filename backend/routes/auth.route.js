import express from "express";
import { authCheck, login, loginWithGoogle, logout, resetPassword, sendOtp, signup, verifyOtp } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/signin", login);
router.post("/signinWithGoogle", loginWithGoogle);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/resetPassword", resetPassword);
// router.post("/signin/facebook", loginWithFacebook);
router.post("/logout", logout);

router.get("/authCheck", protectRoute, authCheck);

export default router;

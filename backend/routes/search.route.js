import express from "express";
import {
	getSearchHistory,
	removeItemFromSearchHistory,
	searchNews,

} from "../controllers/search.controller.js";

const router = express.Router();

router.get("/news/:query", searchNews);
router.get("/history", getSearchHistory);
router.delete("/history/:id", removeItemFromSearchHistory);

export default router;

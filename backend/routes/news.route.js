import express from "express";
import {
	getAllSources,
	getByCategory,
	getBySource,
	getEverything,
	getTrending,
	search,
} from "../controllers/news.controller.js";
import { get } from "http";

const router = express.Router();

router.get("/getTrending", getTrending);
router.post("/getByCategory", getByCategory);
router.post("/search", search);
router.post("/getBySource", getBySource);
router.get('/getAllSources', getAllSources);
router.get("/getEverything",getEverything );

export default router;

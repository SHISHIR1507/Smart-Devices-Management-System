import express from "express";
import { createLog, getLogs, getUsage } from "../controllers/log.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/logs", createLog);

router.get("/logs", getLogs);

router.get("/usage", getUsage);

export default router;

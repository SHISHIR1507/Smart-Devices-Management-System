import express from "express";
import { createLog, getLogs, getUsage } from "../controllers/log.controller.js";
import { cache, keys } from "../middlewares/cache.js";

const router = express.Router({ mergeParams: true });


router.post("/logs", createLog);

router.get("/logs", getLogs);

router.get("/usage", getUsage);
router.get(
  "/usage",
  cache(60 * 5, (req) => keys.usage(req.params.id, req.query.range || "24h")), // 5 min
  getUsage
);

export default router;

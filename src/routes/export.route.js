import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createExportJob, getExportStatus, downloadExport } from "../controllers/export.controller.js";

const router = Router();
router.post("/logs", authenticate, createExportJob);           // queue export
router.get("/status/:jobId", authenticate, getExportStatus);   // check status
router.get("/download/:jobId", authenticate, downloadExport);  // download file

export default router;

import { Parser as Json2CsvParser } from "json2csv";
import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Log from "../models/Log.model.js";
import redis from "../lib/redis.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const EXPORT_DIR = path.join(process.cwd(), "exports");
if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR);

export const createExportJob = AsyncHandler(async (req, res) => {
  const { deviceId, from, to, format = "csv" } = req.body;
  if (!deviceId) throw new ApiError("deviceId required", 400);

  const jobId = uuidv4();
  const jobKey = `export:job:${jobId}`;

  // mark queued
  await redis.hmset(jobKey, { status: "queued", format, deviceId, createdAt: Date.now().toString() });
  await redis.expire(jobKey, 60 * 60); // 1h

  // simulate async processing
  setTimeout(async () => {
    try {
      await redis.hset(jobKey, "status", "processing");

      const query = { device: deviceId };
      if (from || to) {
        query.timestamp = {};
        if (from) query.timestamp.$gte = new Date(from);
        if (to) query.timestamp.$lte = new Date(to);
      }

      const logs = await Log.find(query).sort({ timestamp: 1 }).lean();

      let filePath;
      if (format === "json") {
        filePath = path.join(EXPORT_DIR, `${jobId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
      } else {
        const parser = new Json2CsvParser({ fields: ["_id", "device", "event", "value", "timestamp"] });
        const csv = parser.parse(logs);
        filePath = path.join(EXPORT_DIR, `${jobId}.csv`);
        fs.writeFileSync(filePath, csv);
      }

      await redis.hmset(jobKey, { status: "done", filePath, finishedAt: Date.now().toString() });
      console.log(`[EMAIL] Export ready for device ${deviceId}. Download: ${filePath}`);
    } catch (e) {
      await redis.hmset(jobKey, { status: "failed", error: e.message });
    }
  }, 10); // start soon

  res.json(new ApiResponse(202, { jobId }, "Export job queued"));
});

export const getExportStatus = AsyncHandler(async (req, res) => {
  const jobKey = `export:job:${req.params.jobId}`;
  const data = await redis.hgetall(jobKey);
  if (!data || !data.status) throw new ApiError("Job not found or expired", 404);
  res.json(new ApiResponse(200, data, "Export status"));
});

export const downloadExport = AsyncHandler(async (req, res) => {
  const jobKey = `export:job:${req.params.jobId}`;
  const data = await redis.hgetall(jobKey);
  if (!data || data.status !== "done") throw new ApiError("Export not ready", 400);
  res.download(data.filePath);
});

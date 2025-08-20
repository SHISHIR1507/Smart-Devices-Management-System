import mongoose from "mongoose";
import Log from "../models/Log.model.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Device from "../models/Device.model.js";

const createLog = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { event, value } = req.body;

  if (!event || value == null) {
    throw new ApiError(400, "Event and value are required");
  }

  const log = await Log.create({ device: new mongoose.Types.ObjectId(id), event, value });
  await Device.findByIdAndUpdate(id, { last_active_at: new Date() });

  const response = new ApiResponse(201, log, "Log created successfully");

  res.status(response.statusCode).json(response);
});

const getLogs = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  const logs = await Log.find({ device: new mongoose.Types.ObjectId(id) })
    .sort({ timestamp: -1 })
    .limit(limit);

  const response = new ApiResponse(200, logs, `Last ${logs.length} logs fetched`);
  res.status(response.statusCode).json(response);
});

const getUsage = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const range = req.query.range || "24h";

  let hours = 24;
  if (range.endsWith("h")) {
    hours = parseInt(range.replace("h", ""));
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const logs = await Log.aggregate([
    {
      $match: {
        device: new mongoose.Types.ObjectId(id),
        event: "units_consumed",
        timestamp: { $gte: since },
      },
    },
    {
      $group: {
        _id: "$device",
        total_units: { $sum: "$value" },
      },
    },
  ]);

  const response = new ApiResponse(
    200,
    { device_id: id, total_units: logs[0]?.total_units || 0 },
    `Total units consumed in last ${hours}h`
  );

  res.status(response.statusCode).json(response);
});

export { createLog, getLogs, getUsage };

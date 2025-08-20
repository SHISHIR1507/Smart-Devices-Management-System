import Device from "../models/Device.model.js";
import  AsyncHandler  from "../utils/AsyncHandler.js";
import  ApiError  from "../utils/ApiError.js";
import  ApiResponse  from "../utils/ApiResponse.js";
import { invalidateDeviceLists } from "../middlewares/cache.js";
import { getIO } from "../lib/socket.js";

const registerDevice = AsyncHandler(async (req, res) => {

  const { name, type, status } = req.body;

  if (!name || !type) {
    throw new ApiError("Name and type are required", 400);
  }

  const device = await Device.create({

    name,
    type,
    status: status || "inactive",
    owner_id: req.user.userId,
    
  });
  await invalidateDeviceLists(req.user.userId);
  return res
    .status(201)
    .json(new ApiResponse(201, device, "Device registered successfully"));
  

});

const listDevices = AsyncHandler(async (req, res) => {
  const { type, status } = req.query;

  let filter = { owner_id: req.user.userId };
  if (type) filter.type = type;
  if (status) filter.status = status;

  const devices = await Device.find(filter);

  return res
    .status(200)
    .json(new ApiResponse(200, devices, "Devices fetched successfully"));
});

const updateDevice = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const device = await Device.findOneAndUpdate(
    { _id: id, owner_id: req.user.userId },
    updates,
    { new: true }
  );
  await invalidateDeviceLists(req.user.userId);


  if (!device) {
    throw new ApiError("Device not found or not owned by user", 404);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, device, "Device updated successfully"));
});

const removeDevice = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const device = await Device.findOneAndDelete({
    _id: id,
    owner_id: req.user.userId,
  });
  await invalidateDeviceLists(req.user.userId);

  if (!device) {
    throw new ApiError("Device not found or not owned by user", 404);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, device, "Device removed successfully"));
});

const heartbeatDevice = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const device = await Device.findOneAndUpdate(
    { _id: id, owner_id: req.user.userId },
    { status, last_active_at: new Date() },
    { new: true }
  );
  getIO().emit("device:heartbeat", {
  deviceId: device._id,
  status: device.status,
  last_active_at: device.last_active_at,
  owner_id: device.owner_id
});

  if (!device) {
    throw new ApiError("Device not found or not owned by user", 404);
  }

  return res.status(200).json(
    new ApiResponse(200, {
      success: true,
      message: "Device heartbeat recorded",
      last_active_at: device.last_active_at,
    })
  );
});

export { registerDevice, listDevices, updateDevice, removeDevice, heartbeatDevice };
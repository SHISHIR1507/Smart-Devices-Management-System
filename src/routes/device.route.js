import { Router } from "express";
import { registerDevice, listDevices, updateDevice, removeDevice, heartbeatDevice } from "../controllers/device.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();


router.use(authenticate);

router.post("/", authenticate,registerDevice);

router.get("/", authenticate, listDevices);

router.patch("/:id", authenticate, updateDevice);

router.delete("/:id", authenticate, removeDevice);

router.post("/:id/heartbeat", authenticate, heartbeatDevice);

export default router;

import { Router } from "express";
import { registerDevice, listDevices, updateDevice, removeDevice, heartbeatDevice ,getAnalytics} from "../controllers/device.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { cache, keys } from "../middlewares/cache.js";


const router = Router();


router.use(authenticate);

router.post("/", authenticate,registerDevice);

router.get(
  "/",
  authenticate,
  cache(60 * 15, (req) => keys.devicesList(req.user.userId, req.query)), // 15 min
  listDevices
);

router.get("/analytics", authenticate, getAnalytics);

router.get("/", authenticate, listDevices);

router.patch("/:id", authenticate, updateDevice);

router.delete("/:id", authenticate, removeDevice);

router.post("/:id/heartbeat", authenticate, heartbeatDevice);

export default router;

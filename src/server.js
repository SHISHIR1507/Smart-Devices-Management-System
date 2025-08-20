import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/database.js";
import cookieParser from "cookie-parser";
import { authLimiter, deviceLimiter } from "./middlewares/limiters.js";

import { deactivateInactiveDevices } from "./lib/deviceJobs.js";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { requestLogger } from "./middlewares/reqLogger.js";
import http from "http";
import { initSocket } from "./lib/socket.js";



dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("tiny"));
app.use(requestLogger);
const server = http.createServer(app);
initSocket(server);

//rate limit
/*const limiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 100, 
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req), 
  message: {
    success: false,
    message: "Too many requests, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);*/

// Importing routes
import userRoutes from "./routes/user.route.js";
import deviceRoutes from "./routes/device.route.js";
import logRoutes from "./routes/log.route.js";
import exportRoutes from "./routes/export.route.js";


//Actual device routes
app.use("/auth", userRoutes);
app.use("/devices", deviceRoutes);
app.use("/devices/:id", logRoutes);
app.use("/export", exportRoutes);


app.use("/auth", authLimiter, userRoutes);
app.use("/devices", deviceLimiter, deviceRoutes);
app.use("/devices/:id", deviceLimiter, logRoutes);

//deactivate inactive devices
deactivateInactiveDevices();

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
app.use((err, req, res, next) => {
    console.error(err); // logs error for debugging
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});

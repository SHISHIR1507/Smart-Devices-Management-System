import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/database.js";
import cookieParser from "cookie-parser";
import rateLimit , { ipKeyGenerator } from "express-rate-limit";
import { deactivateInactiveDevices } from "./lib/deviceJobs.js";


dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());

//rate limt
const limiter = rateLimit({
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

app.use(limiter);

// Importing routes
import userRoutes from "./routes/user.route.js";
import deviceRoutes from "./routes/device.route.js";
import logRoutes from "./routes/log.route.js";

//Actual device routes
app.use("/auth", userRoutes);
app.use("/devices", deviceRoutes);
app.use("/devices/:id", logRoutes);

//deactivate inactive devices
deactivateInactiveDevices();


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

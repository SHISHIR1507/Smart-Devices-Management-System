import User from "../models/User.model.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { signAccessToken, signRefreshToken, isRefreshValid, revokeRefreshToken } from "../services/token.service.js";

const signup = AsyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if ([fullName, email, password].some((f) => !f || f.trim() === "")) throw new ApiError("All fields are required", 400);

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError("User already exists with this email", 400);

  const user = await User.create({ fullName, email, password, role });

  const accessToken = signAccessToken({ userId: user._id, role: user.role });
  const refreshToken = await signRefreshToken(user._id.toString());

  res
    .cookie("jwt", accessToken, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" })
    .cookie("rt", refreshToken, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" })
    .status(201)
    .json(new ApiResponse(201, {
      token: accessToken,
      refreshToken,
      user: { id: user._id, name: user.fullName, email: user.email, role: user.role }
    }, "User created successfully"));
});

const login = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError("Email and password are required", 400);

  const user = await User.findOne({ email });
  if (!user || !(await user.isPasswordCorrect(password))) throw new ApiError("Invalid email or password", 401);

  const accessToken = signAccessToken({ userId: user._id, role: user.role });
  const refreshToken = await signRefreshToken(user._id.toString());

  res
    .cookie("jwt", accessToken, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" })
    .cookie("rt", refreshToken, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" })
    .status(200)
    .json({
      success: true,
      token: accessToken,
      refreshToken,
      user: { id: user._id, name: user.fullName, email: user.email, role: user.role },
    });
});

const refresh = AsyncHandler(async (req, res) => {
  const token = req.cookies.rt || req.body.refreshToken || req.headers["x-refresh-token"];
  if (!token) throw new ApiError("Refresh token missing", 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "refresh") throw new ApiError("Invalid token type", 401);

    const userId = decoded.sub;
    const jti = decoded.jti;

    const valid = await isRefreshValid(userId, jti);
    if (!valid) throw new ApiError("Refresh token revoked/expired", 401);

    // rotate: revoke old and issue new
    await revokeRefreshToken(userId, jti);
    const newAccess = signAccessToken({ userId, role: req.user?.role }); // role isn’t in refresh; fetch user if needed
    const newRefresh = await signRefreshToken(userId);

    res
      .cookie("jwt", newAccess, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" })
      .cookie("rt", newRefresh, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" })
      .json({ success: true, token: newAccess, refreshToken: newRefresh });
  } catch (e) {
    throw new ApiError("Invalid or expired refresh token", 401);
  }
});

const logout = AsyncHandler(async (req, res) => {
  // best effort revoke current refresh token
  const token = req.cookies.rt || req.headers["x-refresh-token"];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type === "refresh") {
        await revokeRefreshToken(decoded.sub, decoded.jti);
      }
    } catch {}
  }
  res.clearCookie("jwt");
  res.clearCookie("rt");
  res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

export { signup, login, refresh, logout };

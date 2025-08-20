import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import redis from "../lib/redis.js";

const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TTL_SEC = 7 * 24 * 60 * 60; // 7 days in seconds

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
}

export async function signRefreshToken(userId) {
  const jti = uuidv4();
  const token = jwt.sign({ sub: userId, jti, type: "refresh" }, process.env.JWT_SECRET, { expiresIn: REFRESH_TTL_SEC });
  // store jti -> active
  await redis.setex(`rt:${userId}:${jti}`, REFRESH_TTL_SEC, "active");
  return token;
}

export async function revokeRefreshToken(userId, jti) {
  // mark revoked; optional set to "revoked"
  await redis.del(`rt:${userId}:${jti}`);
}

export async function isRefreshValid(userId, jti) {
  const val = await redis.get(`rt:${userId}:${jti}`);
  return val === "active";
}

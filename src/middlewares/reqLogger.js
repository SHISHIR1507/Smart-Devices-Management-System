export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1e6;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms.toFixed(1)}ms - IP:${ip}`);
  });
  next();
}

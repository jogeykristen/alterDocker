const rateLimit = {};

const rateLimiter = (maxRequests, timeWindow, handler) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized access",
        });
      }

      const currentTime = Date.now();
      if (!rateLimit[userId]) {
        rateLimit[userId] = [];
      }

      rateLimit[userId] = rateLimit[userId].filter(
        (timestamp) => currentTime - timestamp < timeWindow * 1000
      );

      if (rateLimit[userId].length >= maxRequests) {
        return res.status(429).json({
          status: "error",
          message: "Too many requests. Please slow down.",
        });
      }

      rateLimit[userId].push(currentTime);
      return handler(req, res, next);
    } catch (error) {
      console.error("Rate limiter error:", error);
      res.status(500).json({ status: "error", message: "Server error" });
    }
  };
};

module.exports = rateLimiter;

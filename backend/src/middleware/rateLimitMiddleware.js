const buckets = new Map();

const now = () => Date.now();

const getBucketKey = (req, key) => `${key}:${req.ip || "unknown"}`;

export const rateLimit = ({ windowMs, max, key }) => (req, res, next) => {
  const bucketKey = getBucketKey(req, key);
  const entry = buckets.get(bucketKey);
  const timestamp = now();

  if (!entry || entry.resetAt <= timestamp) {
    buckets.set(bucketKey, { count: 1, resetAt: timestamp + windowMs });
    return next();
  }

  if (entry.count >= max) {
    return res.status(429).json({ message: "Too many requests. Please try again later." });
  }

  entry.count += 1;
  buckets.set(bucketKey, entry);
  return next();
};

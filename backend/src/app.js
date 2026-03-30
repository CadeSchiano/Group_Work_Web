import "dotenv/config";
import cors from "cors";
import express from "express";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
const allowedOrigin = process.env.CLIENT_URL;

app.disable("x-powered-by");
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);
app.use((_, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);
app.use(errorHandler);

export default app;

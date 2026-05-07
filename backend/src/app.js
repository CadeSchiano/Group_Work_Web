import "dotenv/config";
import cors from "cors";
import express from "express";

console.log("Before routes import");

import routes from "./routes/index.js";

console.log("After routes import");

import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

console.log("Creating express app");

const allowedOrigin = process.env.CLIENT_URL;

app.disable("x-powered-by");

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

console.log("Routes mounted");

app.use(errorHandler);

console.log("App ready");

export default app;
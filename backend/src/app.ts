import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import authRouter from "./routes/auth-route.js";
import eventRouter from "./routes/event-routes.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/events", eventRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(notFoundHandler);
app.use(errorHandler);

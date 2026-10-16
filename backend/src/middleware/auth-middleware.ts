import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

import { config } from "../config.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "USER" | "ADMIN";
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);

    if (
      typeof payload === "string" ||
      typeof payload.userId !== "string" ||
      (payload.role !== "USER" && payload.role !== "ADMIN")
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

import { Router } from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import {
  cancelBookingHandler,
  createBookingHandler,
  listMyBookingsHandler,
} from "../handlers/booking-handler.js";

const bookingRouter = Router();

bookingRouter.get("/", authMiddleware, listMyBookingsHandler);
bookingRouter.post("/", authMiddleware, createBookingHandler);
bookingRouter.patch("/:id/cancel", authMiddleware, cancelBookingHandler);

export default bookingRouter;

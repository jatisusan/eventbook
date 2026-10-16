import { Router } from "express";

import {
  createEventHandler,
  deleteEventHandler,
  getEventByIdHandler,
  listEventsHandler,
  updateEventHandler,
} from "../handlers/event-handler.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middleware/auth-middleware.js";

const eventRouter = Router();

eventRouter.get("/", listEventsHandler);
eventRouter.get("/:id", getEventByIdHandler);
eventRouter.post("/", authMiddleware, adminMiddleware, createEventHandler);
eventRouter.patch("/:id", authMiddleware, adminMiddleware, updateEventHandler);
eventRouter.delete("/:id", authMiddleware, adminMiddleware, deleteEventHandler);

export default eventRouter;

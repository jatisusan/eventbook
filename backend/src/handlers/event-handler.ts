import type { Request, Response, NextFunction } from "express";

import { prisma } from "../db/prisma.js";
import {
  createEventSchema,
  updateEventSchema,
} from "../validators/event-validator.js";
import { AuthenticatedRequest } from "../middleware/auth-middleware.js";
import { Prisma } from "@prisma/client";

export const listEventsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        startsAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        startsAt: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully.",
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

export const getEventByIdHandler = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event retrieved successfully.",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const createEventHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = createEventSchema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    const { title, description, startsAt, venue, totalSeats } = result.data;
    const eventStart = new Date(startsAt);

    if (eventStart <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event must start in the future.",
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startsAt: eventStart,
        venue,
        totalSeats,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEventHandler = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = updateEventSchema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    if (Object.keys(result.data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    if (result.data.startsAt !== undefined) {
      const eventStart = new Date(result.data.startsAt);

      if (eventStart <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Event must start in the future.",
        });
      }
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...result.data,
        ...(result.data.startsAt !== undefined && {
          startsAt: new Date(result.data.startsAt),
        }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEventHandler = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    await prisma.event.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete an event that has bookings.",
      });
    }

    return next(error);
  }
};

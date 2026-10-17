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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    const [events, totalEvents] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { startsAt: "asc" },
        include: {
          _count: {
            select: {
              bookings: {
                where: { status: "CONFIRMED" },
              },
            },
          },
        },
      }),
      prisma.event.count(),
    ]);

    const eventsWithSeatsLeft = events.map((event) => ({
      ...event,
      seatsLeft: event.totalSeats - event._count.bookings,
      _count: undefined,
    }));

    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully.",
      data: eventsWithSeatsLeft,
      page,
      limit,
      totalEvents,
      totalPages: Math.ceil(totalEvents / limit),
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
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: "CONFIRMED" },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const eventWithSeatsLeft = {
      ...event,
      seatsLeft: event.totalSeats - event._count.bookings,
      _count: undefined,
    };

    return res.status(200).json({
      success: true,
      message: "Event retrieved successfully.",
      data: eventWithSeatsLeft,
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

    if (
      result.data.totalSeats !== undefined &&
      result.data.totalSeats < existingEvent.totalSeats
    ) {
      const confirmedBookings = await prisma.booking.count({
        where: {
          eventId: id,
          status: "CONFIRMED",
        },
      });

      if (result.data.totalSeats < confirmedBookings) {
        return res.status(400).json({
          success: false,
          message:
            "Total seats cannot be less than the number of confirmed bookings.",
        });
      }
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

    next(error);
  }
};

export const listEventBookingsHandler = async (
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

    const bookings = await prisma.booking.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        cancelledAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully.",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

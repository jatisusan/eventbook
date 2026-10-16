import type { NextFunction, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth-middleware.js";
import { createBookingSchema } from "../validators/booking-validator.js";

export const createBookingHandler = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const result = createBookingSchema.safeParse(req.body);

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

  const { eventId } = result.data;
  const userId = req.user.userId;

  try {
    const bookingResult = await prisma.$transaction(async (tx) => {
      // Lock this event row so concurrent bookings cannot exceed capacity.
      const lockedEvents = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM events
        WHERE id = ${eventId}::uuid
        FOR UPDATE
      `;

      if (lockedEvents.length === 0) {
        return { kind: "not_found" as const };
      }

      const event = await tx.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        return { kind: "not_found" as const };
      }

      if (event.startsAt <= new Date()) {
        return { kind: "past_event" as const };
      }

      const existingBooking = await tx.booking.findFirst({
        where: {
          userId,
          eventId,
          status: "CONFIRMED",
        },
        select: { id: true },
      });

      if (existingBooking) {
        return { kind: "duplicate" as const };
      }

      const confirmedBookings = await tx.booking.count({
        where: {
          eventId,
          status: "CONFIRMED",
        },
      });

      if (confirmedBookings >= event.totalSeats) {
        return { kind: "full" as const };
      }

      const booking = await tx.booking.create({
        data: { userId, eventId },
        select: {
          id: true,
          userId: true,
          eventId: true,
          status: true,
          createdAt: true,
          cancelledAt: true,
        },
      });

      return { kind: "created" as const, booking };
    });

    switch (bookingResult.kind) {
      case "not_found":
        return res.status(404).json({
          success: false,
          message: "Event not found.",
        });

      case "past_event":
        return res.status(400).json({
          success: false,
          message: "Cannot book an event that has already started.",
        });

      case "duplicate":
        return res.status(409).json({
          success: false,
          message: "You already have an active booking for this event.",
        });

      case "full":
        return res.status(409).json({
          success: false,
          message: "This event has no seats available.",
        });

      case "created":
        return res.status(201).json({
          success: true,
          message: "Booking created successfully.",
          data: bookingResult.booking,
        });
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "You already have an active booking for this event.",
      });
    }

    throw error;
  }
};

export const cancelBookingHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const bookingId = String(req.params.id);
    const { userId } = req.user;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: {
          select: {
            startsAt: true,
          },
        },
      },
    });

    if (!booking || booking.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(409).json({
        success: false,
        message: "This booking has already been cancelled.",
      });
    }

    if (booking.event.startsAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a booking for an event that has already started.",
      });
    }

    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        status: true,
        createdAt: true,
        cancelledAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      data: cancelledBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const listMyBookingsHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            startsAt: true,
            venue: true,
            totalSeats: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

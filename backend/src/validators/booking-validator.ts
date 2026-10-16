import { z } from "zod";

export const createBookingSchema = z.object({
  eventId: z.uuid("A valid event ID is required."),
});

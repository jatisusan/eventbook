import { z } from "zod";

export const createEventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(150),
  description: z.string().trim().min(1, "Description is required."),
  startsAt: z.iso.datetime({ message: "Provide a valid ISO datetime." }),
  venue: z
    .string()
    .trim()
    .min(2, "Venue must be at least 2 characters.")
    .max(200),
  totalSeats: z
    .number()
    .int()
    .positive("Total seats must be a positive integer."),
});

export const updateEventSchema = createEventSchema.partial();

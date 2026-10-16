import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email("Please provide a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.email("Please provide a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required."),
});
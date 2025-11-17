import { z } from "zod";

// schema validasi register
export const registerValidationSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginValidationSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required"),
});

export const updateUserValidationSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long").optional(),
  email: z.string().email("Invalid email address.").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .optional(),
});

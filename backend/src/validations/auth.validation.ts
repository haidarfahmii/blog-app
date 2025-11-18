import { z } from "zod";

// schema validasi register
export const registerValidationSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Name must be at most 100 characters long"),
  email: z.string().email("Invalid email address.").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be at most 100 characters long"),
});

export const loginValidationSchema = z.object({
  email: z.string().email("Invalid email address.").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const updateUserValidationSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(100, "Name must be at most 100 characters long")
      .optional(),
    email: z.string().email("Invalid email address.").toLowerCase().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "New password must be at most 100 characters long")
      .optional(),
    currentPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Jika password diisi, currentPassword harus diisi juga
      if (data.password && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required when updating password",
      path: ["currentPassword"],
    }
  );

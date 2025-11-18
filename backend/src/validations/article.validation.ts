import { z } from "zod";

export const createArticleValidationSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters long")
    .max(200, "Title must be at most 200 characters long")
    .trim(),
  imageUrl: z.string().url("Invalid image URL").trim(),
  category: z.string().min(3, "Category is required").trim(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must be at most 500 characters")
    .trim(),
  content: z.string().min(50, "Content must be at least 50 characters").trim(),
  published: z.boolean().optional().default(false),
});

export const updateArticleValidationSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters long")
    .max(200, "Title must be at most 200 characters long")
    .trim()
    .optional(),
  imageUrl: z.string().url("Invalid image URL").trim().optional(),
  category: z.string().min(3, "Category is required").trim().optional(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must be at most 500 characters")
    .trim()
    .optional(),
  content: z
    .string()
    .min(50, "Content must be at least 50 characters")
    .trim()
    .optional(),
  published: z.boolean().optional(),
  // Slug tidak boleh diubah secara manual setelah dibuat
  slug: z.never().optional(),
});

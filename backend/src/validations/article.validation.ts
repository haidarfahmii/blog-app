import { z } from "zod";

export const createArticleValidationSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  imageUrl: z.string().url("Invalid image URL"),
  category: z.string().min(3, "Category is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  published: z.boolean().optional().default(false),
});

export const updateArticleValidationSchema = createArticleValidationSchema
  .partial()
  .extend({
    // Slug tidak boleh diubah secara manual setelah dibuat
    slug: z.never().optional(),
  });

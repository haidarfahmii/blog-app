"use client";

import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { articleSchema } from "@/schemas/auth.schema"; // Pastikan schema ini sudah ada di step sebelumnya
import { useRouter } from "next/navigation";
import { articleService } from "@/services/article";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CreateArticlePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      category: "",
      imageUrl: "",
      content: "",
    },
    validationSchema: toFormikValidationSchema(articleSchema),
    onSubmit: async (values) => {
      try {
        setError("");
        await articleService.createArticle(values);
        router.push("/dashboard");
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to create article");
      }
    },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="pl-0 hover:bg-transparent hover:text-primary"
        >
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Article</CardTitle>
          <CardDescription>Write something amazing today.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Article Title"
                  {...formik.getFieldProps("title")}
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="text-xs text-red-500">{formik.errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. Technology, Lifestyle"
                  {...formik.getFieldProps("category")}
                />
                {formik.touched.category && formik.errors.category && (
                  <p className="text-xs text-red-500">
                    {formik.errors.category}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Cover Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                {...formik.getFieldProps("imageUrl")}
              />
              {formik.touched.imageUrl && formik.errors.imageUrl && (
                <p className="text-xs text-red-500">{formik.errors.imageUrl}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                placeholder="A brief summary of your article..."
                className="h-20 resize-none"
                {...formik.getFieldProps("description")}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-xs text-red-500">
                  {formik.errors.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your full content here..."
                className="min-h-[300px] font-mono text-sm"
                {...formik.getFieldProps("content")}
              />
              <p className="text-xs text-muted-foreground">
                * Tip: You can use Markdown here if you want to format your text
                manually.
              </p>
              {formik.touched.content && formik.errors.content && (
                <p className="text-xs text-red-500">{formik.errors.content}</p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Create Article"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

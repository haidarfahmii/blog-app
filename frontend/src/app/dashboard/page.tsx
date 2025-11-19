"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { articleService, Article } from "@/services/article";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify"; // Opsional: untuk notifikasi (perlu install)

export default function DashboardPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch Data
  const loadArticles = async () => {
    if (user?.id) {
      try {
        const data = await articleService.getUserArticles(user.id);
        setArticles(data);
      } catch (error) {
        console.error("Failed to load articles", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadArticles();
  }, [user]);

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        await articleService.deleteArticle(id);
        setArticles(articles.filter((a) => a.id !== id));
      } catch (error) {
        alert("Failed to delete article");
      }
    }
  };

  // Handle Publish Toggle
  const handleTogglePublish = async (id: string) => {
    try {
      const updated = await articleService.togglePublish(id);
      setArticles(
        articles.map((a) =>
          a.id === id ? { ...a, published: updated.published } : a
        )
      );
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your articles and content.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/write">
            <Plus className="mr-2 h-4 w-4" /> Create Article
          </Link>
        </Button>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-16">
            <CardTitle className="text-xl">No articles yet</CardTitle>
            <CardDescription>
              You haven't created any articles. Start writing your first post!
            </CardDescription>
            <div className="mt-4 flex justify-center">
              <Button asChild variant="secondary">
                <Link href="/dashboard/write">Create Now</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="flex flex-col overflow-hidden border-l-4 border-l-primary"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1 text-lg">
                      {article.title}
                    </CardTitle>
                    <div className="flex gap-2 items-center">
                      <Badge
                        variant={article.published ? "default" : "secondary"}
                      >
                        {article.published ? "Published" : "Draft"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {article.description}
                </p>
              </CardContent>
              <div className="flex items-center gap-2 p-4 pt-0 mt-auto border-t bg-muted/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => handleTogglePublish(article.id)}
                >
                  {article.published ? (
                    <EyeOff className="h-4 w-4 mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  {article.published ? "Unpublish" : "Publish"}
                </Button>
                {/* Tombol Edit - Nanti diarahkan ke halaman edit */}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(article.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

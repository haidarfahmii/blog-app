import api from "@/lib/axios";

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  category: string;
  published: boolean;
  slug: string;
  createdAt: string;
  author: {
    name: string;
  };
}

export const articleService = {
  // Ambil artikel milik user yang sedang login
  getUserArticles: async (userId: string) => {
    const response = await api.get(`/users/${userId}/articles`);
    return response.data.data as Article[];
  },

  // Buat artikel baru
  createArticle: async (data: any) => {
    const response = await api.post("/articles", data);
    return response.data.data;
  },

  // Update artikel
  updateArticle: async (id: string, data: any) => {
    const response = await api.put(`/articles/${id}`, data);
    return response.data.data;
  },

  // Hapus artikel
  deleteArticle: async (id: string) => {
    await api.delete(`/articles/${id}`);
  },

  // Publish/Unpublish
  togglePublish: async (id: string) => {
    const response = await api.patch(`/articles/${id}/publish`);
    return response.data.data;
  },
};

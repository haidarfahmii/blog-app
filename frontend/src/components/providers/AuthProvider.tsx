"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { AuthState, User } from "@/types/auth";

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fungsi untuk mengambil data user berdasarkan token
  const fetchUser = async (token: string) => {
    try {
      const decoded: any = jwtDecode(token);
      // Asumsi payload token memiliki field 'userId' sesuai auth.service.ts backend
      const userId = decoded.userId;

      if (!userId) throw new Error("Invalid token payload");

      // Fetch full user data from backend
      const response = await api.get(`/users/${userId}`);

      // Sesuaikan dengan struktur response backend { success: true, data: User }
      setUser(response.data.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Efek saat pertama kali load (Restore Session)
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (token: string) => {
    Cookies.set("token", token, { expires: 1 }); // Simpan token 1 hari
    await fetchUser(token);
    router.push("/dashboard"); // Redirect ke dashboard
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

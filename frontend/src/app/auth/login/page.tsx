"use client";

import Link from "next/link";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { loginSchema } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/providers/AuthProvider";
import api from "@/lib/axios";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: toFormikValidationSchema(loginSchema),
    onSubmit: async (values) => {
      try {
        setServerError("");
        const res = await api.post("/auth/login", values);
        // Backend login mengembalikan { data: { token } }
        await login(res.data.data.token);
      } catch (err: any) {
        setServerError(
          err.response?.data?.message || "Invalid email or password"
        );
      }
    },
  });

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your email and password to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {serverError && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...formik.getFieldProps("email")}
              placeholder="m@example.com"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-500">{formik.errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="#"
                className="text-sm underline text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              {...formik.getFieldProps("password")}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-500">{formik.errors.password}</p>
            )}
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline hover:text-primary">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

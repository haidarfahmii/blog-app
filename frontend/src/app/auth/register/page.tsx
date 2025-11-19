"use client";

import Link from "next/link";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { registerSchema } from "@/schemas/auth.schema";
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

export default function RegisterPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: toFormikValidationSchema(registerSchema),
    onSubmit: async (values) => {
      try {
        setServerError("");
        const res = await api.post("/auth/register", values);
        // Backend register mengembalikan { data: { user, token } }
        // Kita langsung login otomatis setelah register berhasil
        if (res.data.data.token) {
          await login(res.data.data.token);
        }
      } catch (err: any) {
        setServerError(
          err.response?.data?.message ||
            "Registration failed. Please try again."
        );
      }
    },
  });

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your email below to create your account
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...formik.getFieldProps("name")}
              placeholder="John Doe"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-red-500">{formik.errors.name}</p>
            )}
          </div>

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
            <Label htmlFor="password">Password</Label>
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
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-primary">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

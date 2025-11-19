"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menu,
  PenSquare,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();

  // Helper untuk styling link aktif
  const getLinkClass = (path: string) => {
    return pathname === path
      ? "text-primary font-bold"
      : "text-foreground/60 hover:text-foreground/80 transition-colors";
  };

  // Ambil inisial nama untuk Avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 ">
        <div className="navbar min-h-16 px-0 ">
          {/* Mobile Menu (Hamburger) */}
          <div className="navbar-start lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/">Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/articles">Articles</Link>
                </DropdownMenuItem>
                {/* Menu tambahan di mobile jika login */}
                {isLoggedIn && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Logo */}
          <div className="navbar-start w-full lg:w-auto justify-center lg:justify-start">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tighter"
            >
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                B
              </div>
              <span>BlogApp</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="navbar hidden lg:flex">
            <ul className="menu menu-horizontal px-1 gap-6 text-sm font-medium ">
              <li>
                <Link href="/" className={getLinkClass("/")}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/articles" className={getLinkClass("/articles")}>
                  Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Side (Search, Theme, Auth) */}
          <div className="navbar-end gap-2">
            <ThemeToggle />

            {isLoggedIn && user ? (
              /* State: LOGGED IN */
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex gap-2"
                  asChild
                >
                  <Link href="/dashboard/write">
                    <PenSquare className="h-4 w-4" />
                    Write
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9 border">
                        {/* Bisa diganti dengan user.avatarUrl jika ada */}
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <span className="text-[10px] bg-primary/10 text-primary px-1 rounded w-fit mt-1">
                          {user.role}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              /* State: GUEST */
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  asChild
                  className="hidden sm:inline-flex"
                >
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

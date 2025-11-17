"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, Menu } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-50">
      <div className="flex items-center justify-between px-6 lg:px-12 h-16">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">EA</span>
          </div>
          <span className="font-bold text-lg hidden sm:inline">EduAnalytics</span>
        </Link>

        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <Button variant="ghost" size="sm" className="gap-2">
              Loading...
            </Button>
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm hidden sm:inline">
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() =>
                signIn("cognito", {
                  callbackUrl: "/onboarding", 
                })
              }
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

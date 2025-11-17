"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  userName: string;
  userEmail?: string;
  userInitial: string;
}

export default function Sidebar({ userName, userEmail, userInitial }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const navGroups = [
    {
      label: "Main",
      items: [
        { href: "/dashboard", label: "Home", icon: Home },
        { href: "/dashboard/sessions", label: "Sessions", icon: FileText },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border flex flex-col shadow-lg transition-all duration-300 z-40",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              EduAnalytics
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Student Analytics Platform
            </p>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-0 top-20 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors translate-x-1/2"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-primary-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-primary-foreground" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                {group.label}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                      isCollapsed && "justify-center px-0",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    title={isCollapsed ? label : undefined}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isCollapsed && "mx-auto"
                      )}
                    />

                    {!isCollapsed && (
                      <span className="text-sm font-medium">{label}</span>
                    )}

                    {/* Tooltip when collapsed */}
                    {isCollapsed && (
                      <div className="absolute left-1/2 -translate-x-1/2 -top-9 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Create Session Button */}
      <div className="p-4 border-t border-border">
        <Link
          href="/dashboard/sessions?create=true"
          className={cn(
            "flex items-center gap-2 w-full bg-accent text-accent-foreground px-4 py-3 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-all duration-200 shadow-sm",
            isCollapsed ? "justify-center" : "justify-center"
          )}
          title={isCollapsed ? "New Session" : undefined}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>New Session</span>}
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-semibold text-sm">
                A
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="text-sm font-medium text-foreground truncate" title={userName}>
                {userName}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center" title={userName}>
              <span className="text-primary-foreground font-semibold text-sm">
                A
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
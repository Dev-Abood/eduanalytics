"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveSession {
  userId: string;
  email: string;
  name: string | null;
  lastSeen: string;
  userAgent: string;
}

export default function ActiveSessionsTable() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const trackCurrentSession = async () => {
    try {
      await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAgent: navigator.userAgent }),
      });
    } catch (error) {
      console.error("Failed to track session:", error);
    }
  };

  useEffect(() => {
    trackCurrentSession();
    fetchSessions();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Users
          </CardTitle>
          <CardDescription>Loading active sessions...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Users
            </CardTitle>
            <CardDescription>
              {sessions.length} {sessions.length === 1 ? "user" : "users"} currently logged in
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active sessions found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.userId}>
                    <TableCell className="font-medium">
                      {session.name || "—"}
                    </TableCell>
                    <TableCell>{session.email}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {session.userId.substring(0, 8)}...
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getBrowserInfo(session.userAgent)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimeAgo(session.lastSeen)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600">
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from 'lucide-react';
import Sidebar from "@/components/sidebar";

interface Session {
  id: string;
  name: string;
  className: string;
  createdAt: string;
  studentsCount: number;
  marksFileKey: string | null;
  attendanceFileKey: string | null;
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (!response.ok) throw new Error("Failed to fetch session");
        
        const data = await response.json();
        setSession(data.session);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  const handleDownload = async (fileType: "marks" | "attendance") => {
    if (!session) return;

    setDownloading(fileType);

    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/download?type=${fileType}`
      );

      if (!response.ok) {
        throw new Error("Failed to generate download URL");
      }

      const data = await response.json();

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar userName="User" userEmail="" userInitial="U" />
        <main className="pt-24 pb-12 px-6 lg:px-12 lg:ml-64">
          <p className="text-foreground/60">Loading session...</p>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar userName="User" userEmail="" userInitial="U" />
        <main className="pt-24 pb-12 px-6 lg:px-12 lg:ml-64">
          <p className="text-foreground/60">Session not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar userName="User" userEmail="" userInitial="U" />

      <main className="pt-24 pb-12 px-6 lg:px-12 lg:ml-64">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="gap-1 text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h1 className="text-4xl font-bold tracking-tight">{session.name}</h1>
              <p className="text-foreground/60">
                Class: <span className="font-medium">{session.className}</span> • Created: {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Download Files Section */}
          <Card>
            <CardHeader>
              <CardTitle>Download CSV Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Marks File */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Marks File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download the marks CSV file for this session
                  </p>
                  <Button
                    onClick={() => handleDownload("marks")}
                    disabled={!session.marksFileKey || downloading === "marks"}
                    className="w-full gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {downloading === "marks" ? "Downloading..." : "Download Marks"}
                  </Button>
                </div>

                {/* Attendance File */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Attendance File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download the attendance CSV file for this session
                  </p>
                  <Button
                    onClick={() => handleDownload("attendance")}
                    disabled={!session.attendanceFileKey || downloading === "attendance"}
                    className="w-full gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {downloading === "attendance" ? "Downloading..." : "Download Attendance"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
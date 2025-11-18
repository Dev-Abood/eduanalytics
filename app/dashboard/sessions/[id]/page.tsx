"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, AlertCircle, TrendingUp } from 'lucide-react';
import Sidebar from "@/components/sidebar";
import { KeyMetrics } from "@/components/charts/key-metrics";
import { ScoreDistributionChart } from "@/components/charts/score-distribution-chart";
import { SubjectDifficultyChart } from "@/components/charts/subject-difficulty-chart";
import { TopPerformersTable } from "@/components/charts/top-performers-table";
import { AtRiskStudentsTable } from "@/components/charts/at-risk-students-table";

interface Session {
  id: string;
  name: string;
  className: string;
  createdAt: string;
  studentsCount: number;
  marksFileKey: string | null;
  attendanceFileKey: string | null;
}

interface Analytics {
  classAnalytics: any;
  studentAnalytics: any[];
  studentsCount: number;
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (!response.ok) throw new Error("Failed to fetch session");
        
        const data = await response.json();
        setSession(data.session);

        // Load analytics
        await loadAnalytics();
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/analytics`);
      if (!response.ok) throw new Error("Failed to load analytics");
      
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

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

  const handleExportReport = () => {
    if (!analytics || !session) return;

    const report = {
      sessionName: session.name,
      className: session.className,
      generatedAt: new Date().toISOString(),
      metrics: {
        totalStudents: analytics.studentsCount,
        averageScore: analytics.classAnalytics.averageScore,
        averageAttendance: analytics.classAnalytics.averageAttendance,
        atRiskCount: analytics.classAnalytics.atRiskStudents.length,
      },
      topPerformers: analytics.classAnalytics.topPerformers,
      atRiskStudents: analytics.classAnalytics.atRiskStudents,
      scoreDistribution: analytics.classAnalytics.scoreDistribution,
      subjectDifficulty: analytics.classAnalytics.subjectDifficulty,
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${session.name}-report-${Date.now()}.json`;
    link.click();
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
            {analytics && (
              <Button
                onClick={handleExportReport}
                className="bg-primary hover:bg-primary/90 text-white gap-2 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            )}
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

          {/* Analytics Section */}
          {isLoadingAnalytics ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading analytics...</p>
              </CardContent>
            </Card>
          ) : analytics ? (
            <>
              {/* Key Metrics */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Key Metrics</h2>
                <KeyMetrics
                  totalStudents={analytics.studentsCount}
                  averageScore={analytics.classAnalytics.averageScore}
                  averageAttendance={analytics.classAnalytics.averageAttendance}
                  atRiskCount={analytics.classAnalytics.atRiskStudents.length}
                />
              </div>

              {/* Charts Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Analytics & Performance</h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  <ScoreDistributionChart data={analytics.classAnalytics.scoreDistribution} />
                  <SubjectDifficultyChart data={analytics.classAnalytics.subjectDifficulty} />
                </div>
              </div>

              {/* Student Performance Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Student Performance</h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  <TopPerformersTable data={analytics.classAnalytics.topPerformers} />
                  <AtRiskStudentsTable data={analytics.classAnalytics.atRiskStudents} />
                </div>
              </div>

              {/* Detailed Student Analysis */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Detailed Student Analysis</h2>
                <Card className="hover:shadow-lg hover:border-foreground/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-base">Individual Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-semibold text-foreground/70">Student</th>
                            <th className="text-right py-3 px-4 font-semibold text-foreground/70">Avg Score</th>
                            <th className="text-right py-3 px-4 font-semibold text-foreground/70">Attendance</th>
                            <th className="text-right py-3 px-4 font-semibold text-foreground/70">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.studentAnalytics
                            .sort((a: any, b: any) => b.averageScore - a.averageScore)
                            .map((student: any, idx: number) => (
                              <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-all duration-300">
                                <td className="py-3 px-4 font-medium">{student.studentName}</td>
                                <td className="text-right py-3 px-4">
                                  <span
                                    className={
                                      student.averageScore >= 80
                                        ? "font-semibold text-green-600"
                                        : student.averageScore >= 60
                                        ? "font-semibold text-amber-600"
                                        : "font-semibold text-red-600"
                                    }
                                  >
                                    {student.averageScore.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="text-right py-3 px-4 text-foreground/70">
                                  {student.attendanceRate.toFixed(1)}%
                                </td>
                                <td className="text-right py-3 px-4">
                                  {student.isAtRisk ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                                      <AlertCircle className="w-3 h-3" />
                                      At Risk
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                                      <TrendingUp className="w-3 h-3" />
                                      Good
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Analytics not available. Please upload CSV files for this session.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
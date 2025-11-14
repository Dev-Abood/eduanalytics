"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from 'lucide-react';
import { calculateClassAnalytics, calculateStudentAnalytics } from "@/lib/analytics";
import { KeyMetrics } from "@/components/charts/key-metrics";
import { ScoreDistributionChart } from "@/components/charts/score-distribution-chart";
import { SubjectDifficultyChart } from "@/components/charts/subject-difficulty-chart";
import { TopPerformersTable } from "@/components/charts/top-performers-table";
import { AtRiskStudentsTable } from "@/components/charts/at-risk-students-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SessionData {
  marksData: any[];
  attendanceData: any[];
}

interface Session {
  id: string;
  name: string;
  className: string;
  createdAt: string;
  studentsCount: number;
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    // Load session
    const allSessions = JSON.parse(localStorage.getItem("sessions") || "[]");
    const current = allSessions.find((s: Session) => s.id === sessionId);
    setSession(current);

    // Load session data
    const sessionData = localStorage.getItem(`session_${sessionId}`);
    if (sessionData && current) {
      const { marks, attendance } = JSON.parse(sessionData);
      const classAnalytics = calculateClassAnalytics(marks, attendance);
      const studentAnalytics = calculateStudentAnalytics(marks, attendance);

      setAnalytics({
        classAnalytics,
        studentAnalytics,
        marksData: marks,
        attendanceData: attendance,
      });
    }

    setIsLoading(false);
  }, [sessionId]);

  const handleDownloadReport = () => {
    if (!analytics) return;

    const report = {
      sessionName: session?.name,
      className: session?.className,
      generatedAt: new Date().toISOString(),
      metrics: {
        totalStudents: analytics.studentAnalytics.size,
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
    link.download = `${session?.name}-report-${Date.now()}.json`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-[240px_1fr]">
        <Sidebar userName="Dr. Smith" />
        <main className="min-h-screen bg-background p-8">
          <p className="text-foreground/60">Loading session...</p>
        </main>
      </div>
    );
  }

  if (!session || !analytics) {
    return (
      <div className="grid lg:grid-cols-[240px_1fr]">
        <Sidebar userName="Dr. Smith" />
        <main className="min-h-screen bg-background p-8">
          <p className="text-foreground/60">Session not found</p>
        </main>
      </div>
    );
  }

  const studentCount = analytics.studentAnalytics.size;

  return (
    <div className="grid lg:grid-cols-[240px_1fr]">
      <Sidebar userName="Dr. Smith" />

      <main className="min-h-screen bg-background">
        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{session.name}</h1>
              <p className="text-foreground/60">
                Class: {session.className} • Created: {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button
              onClick={handleDownloadReport}
              className="gap-2 bg-accent hover:bg-accent/90 text-primary"
            >
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>

          {/* Key Metrics */}
          <KeyMetrics
            totalStudents={studentCount}
            averageScore={analytics.classAnalytics.averageScore}
            averageAttendance={analytics.classAnalytics.averageAttendance}
            atRiskCount={analytics.classAnalytics.atRiskStudents.length}
          />

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ScoreDistributionChart data={analytics.classAnalytics.scoreDistribution} />
            <SubjectDifficultyChart data={analytics.classAnalytics.subjectDifficulty} />
          </div>

          {/* Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            <TopPerformersTable data={analytics.classAnalytics.topPerformers} />
            <AtRiskStudentsTable data={analytics.classAnalytics.atRiskStudents} />
          </div>

          {/* Detailed Student Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Student Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-semibold">Student Name</th>
                      <th className="text-right py-2 px-2 font-semibold">Avg Score</th>
                      <th className="text-right py-2 px-2 font-semibold">Attendance</th>
                      <th className="text-right py-2 px-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(analytics.studentAnalytics.values())
                      .sort((a: any, b: any) => b.averageScore - a.averageScore)
                      .map((student: any, idx: number) => (
                        <tr key={idx} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-2">{student.studentName}</td>
                          <td className="text-right py-3 px-2">
                            <span
                              className={
                                student.averageScore >= 80
                                  ? "font-semibold text-green-500"
                                  : student.averageScore >= 60
                                  ? "font-semibold text-yellow-600"
                                  : "font-semibold text-red-500"
                              }
                            >
                              {student.averageScore.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-right py-3 px-2">
                            {student.attendanceRate.toFixed(1)}%
                          </td>
                          <td className="text-right py-3 px-2">
                            {student.isAtRisk ? (
                              <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-medium">
                                At Risk
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">
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
      </main>
    </div>
  );
}

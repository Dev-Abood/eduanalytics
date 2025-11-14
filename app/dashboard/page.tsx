"use client";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Plus, BookOpen, BarChart3, Users } from "lucide-react";
import Sidebar from "@/components/sidebar";

export default function DashboardPage() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar userName="Dr. Smith" />
        <main className="pt-24 pb-12 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-foreground/60">Welcome back, Dr. Smith</p>
              </div>
              <Link href="/dashboard/sessions?create=true">
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  New Session
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {[
                {
                  icon: BookOpen,
                  label: "Total Sessions",
                  value: "0",
                  description: "No sessions yet",
                },
                {
                  icon: Users,
                  label: "Total Students Analyzed",
                  value: "0",
                  description: "Across all sessions",
                },
              ].map((stat, i) => (
                <Card
                  key={i}
                  className="hover:shadow-lg hover:border-foreground/20 transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <stat.icon className="w-5 h-5 text-primary" />
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs text-foreground/60 mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <Card className="border-2 border-dashed">
              <CardContent className="pt-12 text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">
                    Create Your First Session
                  </h3>
                  <p className="text-foreground/60">
                    Upload your marks and attendance CSV files to start
                    analyzing student performance
                  </p>
                </div>
                <Link href="/dashboard/sessions?create=true">
                  <Button className="bg-primary hover:bg-primary/90 text-white gap-2 mt-5">
                    <Plus className="w-4 h-4 m" />
                    Create New Session
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg hover:border-foreground/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">CSV File Format</CardTitle>
                  <CardDescription>
                    Required columns for marks file
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <code className="block bg-muted p-3 rounded font-mono text-xs">
                    student_id, student_name, class, subject, term,
                    assessment_date, score, max_score
                  </code>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg hover:border-foreground/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">CSV File Format</CardTitle>
                  <CardDescription>
                    Required columns for attendance file
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <code className="block bg-muted p-3 rounded font-mono text-xs">
                    student_id, student_name, class, date, status
                  </code>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

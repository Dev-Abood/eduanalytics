"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

interface KeyMetricsProps {
  totalStudents: number;
  averageScore: number;
  averageAttendance: number;
  atRiskCount: number;
}

export function KeyMetrics({
  totalStudents,
  averageScore,
  averageAttendance,
  atRiskCount,
}: KeyMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Students */}
      <Card className="transition-all duration-300 hover:shadow-lg hover:border-foreground/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10"></div>
        <CardHeader className="pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-foreground/70">Total Students</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-foreground">{totalStudents}</div>
          <p className="text-xs text-foreground/60 mt-1">in this session</p>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card className="transition-all duration-300 hover:shadow-lg hover:border-foreground/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-10 -mt-10"></div>
        <CardHeader className="pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-foreground/70">Avg Score</CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <BarChart3 className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-foreground">{averageScore.toFixed(1)}%</div>
          <p className="text-xs text-foreground/60 mt-1">class average</p>
        </CardContent>
      </Card>

      {/* Attendance Rate */}
      <Card className="transition-all duration-300 hover:shadow-lg hover:border-foreground/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-full -mr-10 -mt-10"></div>
        <CardHeader className="pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-foreground/70">Attendance</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-foreground">{averageAttendance.toFixed(1)}%</div>
          <p className="text-xs text-foreground/60 mt-1">average rate</p>
        </CardContent>
      </Card>

      {/* At-Risk Count */}
      <Card className="transition-all duration-300 hover:shadow-lg hover:border-foreground/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-full -mr-10 -mt-10"></div>
        <CardHeader className="pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-foreground/70">At-Risk</CardTitle>
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-foreground">{atRiskCount}</div>
          <p className="text-xs text-foreground/60 mt-1">students</p>
        </CardContent>
      </Card>
    </div>
  );
}

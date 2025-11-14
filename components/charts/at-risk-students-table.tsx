"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';

interface AtRiskStudent {
  studentName: string;
  averageScore: number;
  attendanceRate: number;
}

interface AtRiskStudentsTableProps {
  data: AtRiskStudent[];
}

export function AtRiskStudentsTable({ data }: AtRiskStudentsTableProps) {
  if (data.length === 0) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg hover:border-foreground/20 border-2 border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <AlertCircle className="w-5 h-5" />
            At-Risk Students
          </CardTitle>
          <CardDescription className="text-green-600">Students with score &lt; 60% or attendance &lt; 75%</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-green-700 font-medium">✓ No at-risk students identified</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:border-foreground/20 border-2 border-red-200 bg-red-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          At-Risk Students
        </CardTitle>
        <CardDescription className="text-red-600">{data.length} student(s) with score &lt; 60% or attendance &lt; 75%</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((student, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-white hover:bg-red-50/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600">
                  !
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{student.studentName}</p>
                  <div className="flex gap-4 text-xs text-foreground/60 mt-1">
                    {student.averageScore < 60 && (
                      <span className="text-red-600 font-medium">Score: {student.averageScore.toFixed(1)}%</span>
                    )}
                    {student.attendanceRate < 75 && (
                      <span className="text-red-600 font-medium">Attendance: {student.attendanceRate.toFixed(1)}%</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

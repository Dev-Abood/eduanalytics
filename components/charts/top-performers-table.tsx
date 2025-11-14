"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from 'lucide-react';

interface TopPerformer {
  studentName: string;
  averageScore: number;
  attendanceRate: number;
}

interface TopPerformersTableProps {
  data: TopPerformer[];
}

export function TopPerformersTable({ data }: TopPerformersTableProps) {
  if (data.length === 0) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg hover:border-foreground/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Performers
          </CardTitle>
          <CardDescription>Highest scoring students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-foreground/60">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:border-foreground/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Top Performers
        </CardTitle>
        <CardDescription>Top {data.length} highest scoring students</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((performer, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{performer.studentName}</p>
                  <p className="text-xs text-foreground/60">Attendance: {performer.attendanceRate.toFixed(1)}%</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{performer.averageScore.toFixed(1)}%</div>
                <p className="text-xs text-foreground/60">avg score</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

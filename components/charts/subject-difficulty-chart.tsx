"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SubjectDifficultyChartProps {
  data: Record<string, number>;
}

export function SubjectDifficultyChart({ data }: SubjectDifficultyChartProps) {
  const chartData = Object.entries(data)
    .map(([subject, difficulty]) => ({
      subject: subject.length > 12 ? subject.substring(0, 12) + "..." : subject,
      fullSubject: subject,
      difficulty: Math.round(difficulty),
    }))
    .sort((a, b) => b.difficulty - a.difficulty);

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:border-foreground/20">
      <CardHeader>
        <CardTitle>Subject Performance</CardTitle>
        <CardDescription>Average score by subject</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="subject" stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              labelFormatter={() => ""}
              formatter={(value) => [`${value}%`, "Avg Score"]}
            />
            <Bar dataKey="difficulty" fill="#1f2937" radius={[8, 8, 0, 0]} animationDuration={500} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

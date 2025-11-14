"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreDistributionChartProps {
  data: Record<string, number>;
}

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  const chartData = Object.entries(data).map(([range, count]) => ({
    range,
    students: count,
  }));

  const getBarColor = (range: string) => {
    if (range.includes("90")) return "#16a34a"; // green
    if (range.includes("80")) return "#2563eb"; // blue
    if (range.includes("70")) return "#f59e0b"; // amber
    if (range.includes("60")) return "#ef4444"; // red
    return "#dc2626"; // dark red
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:border-foreground/20">
      <CardHeader>
        <CardTitle>Score Distribution</CardTitle>
        <CardDescription>Number of students in each score range</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="range" stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            />
            <Bar dataKey="students" radius={[8, 8, 0, 0]} animationDuration={500}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

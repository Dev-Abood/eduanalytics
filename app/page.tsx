"use client";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Users,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section - Full Width */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm font-medium text-foreground">
                Student Analytics Platform
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Transform Student Data Into{" "}
              <span className="text-primary">Actionable Insights</span>
            </h1>

            <p className="text-lg text-foreground/60 leading-relaxed max-w-2xl mx-auto">
              Upload marks and attendance records to generate comprehensive
              analytics, beautiful visualizations, and identify at-risk students
              in minutes.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex justify-center pt-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Features List */}
          <div className="pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm">
              {[
                "CSV file upload with automatic parsing",
                "Real-time analytics and statistics",
                "Beautiful, interactive charts",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-foreground/70">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-12 border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">
              Powerful Features
            </h2>
            <p className="text-lg text-foreground/60">
              Everything you need to analyze student performance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Advanced Charts",
                description:
                  "Beautiful visualizations including score distributions, attendance trends, and subject difficulty analysis.",
              },
              {
                icon: Users,
                title: "Student Insights",
                description:
                  "Identify top performers and at-risk students. Track individual progress and performance patterns.",
              },
              {
                icon: TrendingUp,
                title: "Session Management",
                description:
                  "Create and manage multiple analysis sessions. Keep track of all your historical data.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-xl border border-border bg-white hover:shadow-lg hover:border-foreground/20 transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-foreground/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight mb-16 text-center">
            How It Works
          </h2>

          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Create a Session",
                description:
                  "Click 'New Session' and give your analysis a name.",
              },
              {
                step: 2,
                title: "Upload CSV Files",
                description:
                  "Upload your marks and attendance CSV files. We'll validate the format automatically.",
              },
              {
                step: 3,
                title: "Get Instant Analytics",
                description:
                  "View comprehensive charts, statistics, and student performance insights immediately.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-foreground/60">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

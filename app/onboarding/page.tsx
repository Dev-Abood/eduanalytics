"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    institution: "",
    position: "",
  });

  useEffect(() => {
    async function checkOnboarding() {
      if (status === "loading") return;
      
      if (status === "unauthenticated") {
        router.push("/api/auth/signin?callbackUrl=/onboarding");
        return;
      }

      if (session?.user?.id) {
        try {
          // Check if user already exists in database
          const response = await fetch("/api/user/check");
          const data = await response.json();
          
          if (data.exists && data.onboarded) {
            // User already completed onboarding, redirect to dashboard
            router.push("/dashboard");
          } else {
            // User can proceed with onboarding
            setChecking(false);
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          setChecking(false);
        }
      }
    }

    checkOnboarding();
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      position: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate form
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.age ||
      !formData.institution ||
      !formData.position
    ) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      // Create user in database with onboarding data
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: parseInt(formData.age),
          institution: formData.institution,
          position: formData.position,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save onboarding data");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      setError(error instanceof Error ? error.message : "Failed to save your information. Please try again.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-background text-lg font-bold">EA</span>
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
      <Card className="w-full max-w-md border border-border bg-background shadow-lg">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-background text-lg font-bold">EA</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete your profile to get started with EduAnalytics
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-xs font-semibold text-foreground"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-xs font-semibold text-foreground"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-xs font-semibold text-foreground">
                Age
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="28"
                value={formData.age}
                onChange={handleInputChange}
                className="h-9 text-sm"
                min="18"
                max="120"
              />
            </div>

            {/* Institution */}
            <div className="space-y-2">
              <Label
                htmlFor="institution"
                className="text-xs font-semibold text-foreground"
              >
                Institution Name
              </Label>
              <Input
                id="institution"
                name="institution"
                placeholder="University Name"
                value={formData.institution}
                onChange={handleInputChange}
                className="h-9 text-sm"
              />
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label
                htmlFor="position"
                className="text-xs font-semibold text-foreground"
              >
                Position
              </Label>
              <Select value={formData.position} onValueChange={handleSelectChange}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select your position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="teaching-assistant">Teaching Assistant</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-background font-semibold mt-6"
            >
              {loading ? "Setting up your account..." : "Continue to Dashboard"}
            </Button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              You can update this information later in your account settings
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
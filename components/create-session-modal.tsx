"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (session: any) => void;
}

export default function CreateSessionModal({
  isOpen,
  onClose,
  onSessionCreated,
}: CreateSessionModalProps) {
  const [marksFile, setMarksFile] = useState<File | null>(null);
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [sessionName, setSessionName] = useState("");
  const [className, setClassName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const marksInputRef = useRef<HTMLInputElement>(null);
  const attendanceInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "marks" | "attendance"
  ) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      if (type === "marks") {
        setMarksFile(file);
      } else {
        setAttendanceFile(file);
      }
      setError("");
    } else {
      setError("Please select a valid CSV file");
    }
  };

  const handleCreate = async () => {
    if (!marksFile || !attendanceFile || !sessionName || !className) {
      setError("Please fill all fields and select both files");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("sessionName", sessionName);
      formData.append("className", className);
      formData.append("marksFile", marksFile);
      formData.append("attendanceFile", attendanceFile);

      // Upload to server
      const response = await fetch("/api/sessions", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create session");
      }

      console.log("Session created successfully:", data.session);

      // Reset form
      setSessionName("");
      setClassName("");
      setMarksFile(null);
      setAttendanceFile(null);

      // Notify parent component
      onSessionCreated(data.session);

      // Close modal
      onClose();
    } catch (error) {
      console.error("Error creating session:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create session"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background shadow-2xl border border-border">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Upload your marks and attendance CSV files to start analyzing
            student data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border-red-200 text-red-700 border rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* Session Name */}
          <div>
            <Label className="text-sm font-medium">Session Name</Label>
            <Input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Q1 2025 Analysis"
              className="mt-1"
            />
          </div>

          {/* Class Name */}
          <div>
            <Label className="text-sm font-medium">Class Name</Label>
            <Input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g., Class 10A"
              className="mt-1"
            />
          </div>

          {/* Marks File */}
          <div>
            <Label className="text-sm font-medium block mb-2">Marks File</Label>
            <div
              onClick={() => marksInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-all duration-300"
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-foreground/40" />
              {marksFile ? (
                <>
                  <p className="text-sm font-medium text-accent">
                    {marksFile.name}
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">
                    Click to change file
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    Click to upload marks CSV
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">
                    Required columns: student_id, student_name, class, subject,
                    term, assessment_date, score, max_score
                  </p>
                </>
              )}
            </div>
            <input
              ref={marksInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => handleFileSelect(e, "marks")}
              className="hidden"
            />
          </div>

          {/* Attendance File */}
          <div>
            <Label className="text-sm font-medium block mb-2">
              Attendance File
            </Label>
            <div
              onClick={() => attendanceInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-all duration-300"
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-foreground/40" />
              {attendanceFile ? (
                <>
                  <p className="text-sm font-medium text-accent">
                    {attendanceFile.name}
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">
                    Click to change file
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    Click to upload attendance CSV
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">
                    Required columns: student_id, student_name, class, date,
                    status
                  </p>
                </>
              )}
            </div>
            <input
              ref={attendanceInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => handleFileSelect(e, "attendance")}
              className="hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                isProcessing || !marksFile || !attendanceFile || !sessionName || !className
              }
              className="flex-1 bg-accent hover:bg-accent/90 text-primary"
            >
              {isProcessing ? "Creating..." : "Create Session"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
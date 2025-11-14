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
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { calculateClassAnalytics } from "@/lib/analytics";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const marksInputRef = useRef<HTMLInputElement>(null);
  const attendanceInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // Convert numbers automatically
        complete: (results: any) => {
          const data = results.data.filter((row: any) =>
            Object.values(row).some((v) => v && String(v).trim() !== "")
          );
          resolve(data);
        },
        error: (error: any) => reject(error),
      });
    });
  };

  const validateMarksData = (data: any[]): boolean => {
    if (data.length === 0) {
      setError("Marks file is empty");
      return false;
    }
    const requiredFields = [
      "student_id",
      "student_name",
      "class",
      "subject",
      "term",
      "assessment_date",
      "score",
      "max_score",
    ];
    const firstRow = data[0];
    const missingFields = requiredFields.filter(
      (field) => !(field in firstRow)
    );

    if (missingFields.length > 0) {
      setError(`Marks file missing columns: ${missingFields.join(", ")}`);
      return false;
    }
    return true;
  };

  const validateAttendanceData = (data: any[]): boolean => {
    if (data.length === 0) {
      setError("Attendance file is empty");
      return false;
    }
    const requiredFields = [
      "student_id",
      "student_name",
      "class",
      "date",
      "status",
    ];
    const firstRow = data[0];
    const missingFields = requiredFields.filter(
      (field) => !(field in firstRow)
    );

    if (missingFields.length > 0) {
      setError(`Attendance file missing columns: ${missingFields.join(", ")}`);
      return false;
    }
    return true;
  };

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

  // Helper to estimate JSON size in bytes
  const estimateSize = (obj: any): number => {
    return new Blob([JSON.stringify(obj)]).size;
  };

  // Compress data by removing unnecessary fields and optimizing
  const compressData = (data: any[]): any[] => {
    return data.map(row => {
      const compressed: any = {};
      for (const [key, value] of Object.entries(row)) {
        // Skip null, undefined, and empty strings
        if (value !== null && value !== undefined && value !== '') {
          compressed[key] = value;
        }
      }
      return compressed;
    });
  };

  const handleCreate = async () => {
    if (!marksFile || !attendanceFile || !sessionName) {
      setError("Please fill all fields and select both files");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Parse CSV files
      const marksData = await parseCSV(marksFile);
      const attendanceData = await parseCSV(attendanceFile);

      // Validate data structure
      if (
        !validateMarksData(marksData) ||
        !validateAttendanceData(attendanceData)
      ) {
        setIsProcessing(false);
        return;
      }

      console.log("[Session] Parsed marks data:", marksData.length, "records");
      console.log("[Session] Parsed attendance data:", attendanceData.length, "records");

      // Get class name and student count
      const className = marksData[0]?.class || "Class";
      const uniqueStudents = new Set(marksData.map((r: any) => r.student_id));

      // Calculate analytics
      const analytics = calculateClassAnalytics(marksData, attendanceData);
      console.log("[Session] Analytics calculated");

      // Create session metadata (lightweight)
      const session = {
        id: Date.now().toString(),
        name: sessionName,
        className,
        createdAt: new Date().toISOString(),
        studentsCount: uniqueStudents.size,
        // Store basic stats instead of full data
        stats: {
          marksCount: marksData.length,
          attendanceCount: attendanceData.length,
          subjects: [...new Set(marksData.map((r: any) => r.subject))],
        }
      };

      // Compress the data
      const compressedMarks = compressData(marksData);
      const compressedAttendance = compressData(attendanceData);

      // Store session metadata only in main sessions list
      const allSessions = JSON.parse(localStorage.getItem("sessions") || "[]");
      localStorage.setItem(
        "sessions",
        JSON.stringify([session, ...allSessions])
      );

      // Try to store full data separately, with error handling
      const sessionData = {
        marks: compressedMarks,
        attendance: compressedAttendance,
        analytics,
      };

      const dataSize = estimateSize(sessionData);
      console.log(`[Session] Data size: ${(dataSize / 1024 / 1024).toFixed(2)} MB`);

      // Check if data is too large (localStorage limit is typically 5-10MB)
      if (dataSize > 4.5 * 1024 * 1024) { // 4.5MB threshold
        console.warn("[Session] Data too large for localStorage");
        
        // Store only essential data: analytics + sample of raw data
        const limitedData = {
          marks: compressedMarks.slice(0, 1000), // First 1000 records
          attendance: compressedAttendance.slice(0, 1000),
          analytics,
          truncated: true,
          originalSizes: {
            marks: marksData.length,
            attendance: attendanceData.length
          }
        };
        
        localStorage.setItem(
          `session_${session.id}`,
          JSON.stringify(limitedData)
        );
        
        setError("Warning: Dataset is large. Only analytics and sample data stored. For full data analysis, consider exporting to CSV.");
      } else {
        // Store full compressed data
        localStorage.setItem(
          `session_${session.id}`,
          JSON.stringify(sessionData)
        );
      }

      console.log("[Session] Session created successfully:", session.id);

      onSessionCreated(session);
      setSessionName("");
      setMarksFile(null);
      setAttendanceFile(null);
      
    } catch (error) {
      console.error("[Session] Error processing files:", error);
      
      if (error instanceof Error && error.message.includes("quota")) {
        setError(
          "Storage quota exceeded. Your dataset is too large for browser storage. Please try with a smaller dataset or contact support for alternative solutions."
        );
      } else {
        setError(
          `Error processing files: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
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
            <div className={`${
              error.includes("Warning") 
                ? "bg-yellow-50 border-yellow-200 text-yellow-700" 
                : "bg-red-50 border-red-200 text-red-700"
            } border rounded-lg p-3 text-sm`}>
              {error}
            </div>
          )}

          {/* Session Name */}
          <div>
            <label className="text-sm font-medium">Session Name</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Q1 2025 Analysis"
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Marks File */}
          <div>
            <label className="text-sm font-medium block mb-2">Marks File</label>
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
            <label className="text-sm font-medium block mb-2">
              Attendance File
            </label>
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
                isProcessing || !marksFile || !attendanceFile || !sessionName
              }
              className="flex-1 bg-accent hover:bg-accent/90 text-primary"
            >
              {isProcessing ? "Processing..." : "Create Session"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
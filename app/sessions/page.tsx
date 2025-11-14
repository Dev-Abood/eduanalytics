"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Eye, Plus } from 'lucide-react';
import CreateSessionModal from "@/components/create-session-modal";

interface Session {
  id: string;
  name: string;
  className: string;
  createdAt: string;
  studentsCount: number;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load sessions from localStorage
    const saved = localStorage.getItem("sessions");
    if (saved) {
      setSessions(JSON.parse(saved));
    }
    setIsLoading(false);

    // Check URL params for create modal
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "true") {
      setShowCreateModal(true);
    }
  }, []);

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem("sessions", JSON.stringify(updated));
  };

  const handleSessionCreated = (session: Session) => {
    const updated = [session, ...sessions];
    setSessions(updated);
    localStorage.setItem("sessions", JSON.stringify(updated));
    setShowCreateModal(false);
  };

  return (
    <div className="grid lg:grid-cols-[240px_1fr]">
      <Sidebar userName="Dr. Smith" />

      <main className="min-h-screen bg-background">
        <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Sessions</h1>
              <p className="text-foreground/60">Manage and view all your analysis sessions</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-accent hover:bg-accent/90 text-primary gap-2"
            >
              <Plus className="w-4 h-4" />
              New Session
            </Button>
          </div>

          {/* Sessions List */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-foreground/60">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <p className="text-foreground/60 mb-4">No sessions created yet</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-accent hover:bg-accent/90 text-primary"
                >
                  Create Your First Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sessions.map(session => (
                <Card
                  key={session.id}
                  className="hover:border-accent transition-all duration-300 cursor-pointer group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{session.name}</h3>
                        <p className="text-sm text-foreground/60 mt-1">
                          Class: {session.className} • {session.studentsCount} students
                        </p>
                        <p className="text-xs text-foreground/40 mt-2">
                          Created: {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/sessions/${session.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirm("Delete this session?")) {
                              handleDeleteSession(session.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSessionCreated={handleSessionCreated}
      />
    </div>
  );
}

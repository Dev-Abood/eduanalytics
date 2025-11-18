"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Eye, Plus, Calendar, Users } from 'lucide-react';
import CreateSessionModal from "@/components/create-session-modal";
import Sidebar from "@/components/sidebar";

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
    fetchSessions();

    // Check URL params for create modal
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "true") {
      setShowCreateModal(true);
    }
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      if (!response.ok) throw new Error("Failed to fetch sessions");
      
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete session");

      // Remove from local state
      setSessions(sessions.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session. Please try again.");
    }
  };

  const handleSessionCreated = (session: Session) => {
    setSessions([session, ...sessions]);
    setShowCreateModal(false);
    fetchSessions(); // Refresh list
  };

  return (
    <>
      <Sidebar userName="Dr. Smith" userEmail="" userInitial="D" />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-12 px-6 lg:px-12 lg:ml-64">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Sessions</h1>
                <p className="text-foreground/60">Create and manage your analysis sessions</p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary/90 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                New Session
              </Button>
            </div>

            {/* Sessions Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-foreground/60">Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-12 text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">No Sessions Yet</h3>
                    <p className="text-foreground/60">
                      Create your first session to start analyzing student data
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Session
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {sessions.map(session => (
                  <Card key={session.id} className="hover:shadow-lg hover:border-foreground/20 transition-all duration-300 flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-xl">{session.name}</CardTitle>
                      <CardDescription>{session.className}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-foreground/60">
                          <Users className="w-4 h-4" />
                          <span>{session.studentsCount || 0} students</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground/60">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Link href={`/dashboard/sessions/${session.id}`} className="flex-1">
                          <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white gap-1">
                            <Eye className="w-4 h-4" />
                            View Analytics
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
    </>
  );
}
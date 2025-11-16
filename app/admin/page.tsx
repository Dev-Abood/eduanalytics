import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Activity, Database } from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession();

  // Check authentication
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }

  // Check admin authorization
  if (!isAdmin(session)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You do not have administrator privileges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Contact your system administrator if you believe this is an error.
            </p>
            <div className="flex gap-2">
              <Link
                href="/"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
              >
                Go Home
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 text-sm"
              >
                Dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard content
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                System administration and user management
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Admin: {session.user.email}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current User</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{session.user.email}</div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                ID: {session.user.id}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auth Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cognito authenticated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Administrator</div>
              <p className="text-xs text-muted-foreground mt-1">
                Full access granted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Provider</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AWS Cognito</div>
              <p className="text-xs text-muted-foreground mt-1">
                eu-central-1
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              Current authenticated user information from Cognito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Unique User ID (Cognito Sub)
                  </label>
                  <div className="mt-1">
                    <code className="bg-muted px-3 py-2 rounded text-sm block overflow-x-auto">
                      {session.user.id || session.user.userId}
                    </code>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <code className="bg-muted px-3 py-2 rounded text-sm block">
                      {session.user.email || "(not set)"}
                    </code>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Display Name
                  </label>
                  <div className="mt-1">
                    <code className="bg-muted px-3 py-2 rounded text-sm block">
                      {session.user.name || "(not set)"}
                    </code>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Admin Status
                  </label>
                  <div className="mt-1">
                    <Badge variant="default" className="bg-green-600">
                      ✓ Authorized Administrator
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Full Session Data</CardTitle>
            <CardDescription>
              Complete JWT session payload (for debugging)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96 border">
              {JSON.stringify(session, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/dashboard/sessions"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Manage Sessions
          </Link>
          <Link
            href="/debug"
            className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
          >
            Debug Page
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

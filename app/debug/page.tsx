"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function DebugPage() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      <p className="mb-4">Status: {status}</p>

      {session ? (
        <div>
          <pre className="bg-muted p-4 rounded">{JSON.stringify(session, null, 2)}</pre>
          <button
            className="mt-4 px-3 py-2 bg-red-500 text-white rounded"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-2">No session (not signed in)</p>
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded"
            onClick={() => signIn('cognito')}
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
}

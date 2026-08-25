"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notification-context";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export default function DebugSSEPage() {
  const { isAuthenticated, user } = useAuth();
  const { isSSEConnected } = useNotifications();
  const token = getAccessToken();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const addLogLocal = (message: string) => {
      setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const currentToken = getAccessToken();
    addLogLocal(`Token check: ${currentToken ? "present" : "missing"}`);
    if (currentToken) {
      addLogLocal(`Token length: ${currentToken.length} characters`);
    }
    addLogLocal(`User: ${user ? user.email : "not logged in"}`);
    addLogLocal(`isAuthenticated: ${isAuthenticated}`);
    addLogLocal(`isSSEConnected: ${isSSEConnected}`);
  }, [isAuthenticated, user, isSSEConnected]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      addLog("✅ Token copied to clipboard!");
    }
  };

  const testSSEConnection = async () => {
    const currentToken = getAccessToken();
    if (!currentToken) {
      addLog("ERROR: No token available");
      return;
    }

    addLog("Attempting SSE connection...");
    try {
      const url = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1"
      }/notifications/stream?token=${currentToken}`;
      addLog(`URL: ${url.replace(/token=[^&]+/, "token=***")}`);

      const eventSource = new EventSource(url);

      eventSource.addEventListener("connected", (event) => {
        addLog(`✅ Connected: ${event.data}`);
      });

      eventSource.addEventListener("notification", (event) => {
        addLog(`📩 Notification: ${event.data}`);
      });

      eventSource.addEventListener("ping", () => {
        addLog("💓 Ping received");
      });

      eventSource.onerror = (error) => {
        addLog(`❌ Error: ${JSON.stringify(error)}`);
        eventSource.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        addLog("Closing connection after 10 seconds");
        eventSource.close();
      }, 10000);
    } catch (error) {
      addLog(`❌ Exception: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Heading variant="page" className="text-text-primary">
          SSE Debug Page
        </Heading>

        <div className="bg-surface-float p-6 rounded-lg space-y-4">
          <Heading variant="subsection" as="h2" className="text-text-primary">
            Auth Status
          </Heading>
          <div className="space-y-2 text-body text-text-secondary font-mono">
            <div>Authenticated: {isAuthenticated ? "✅ Yes" : "❌ No"}</div>
            <div>User: {user ? user.email : "Not logged in"}</div>
            <div>SSE Connected: {isSSEConnected ? "✅ Yes" : "❌ No"}</div>
            <div>Token: {token ? "✅ Present" : "❌ Missing"}</div>
            {token && (
              <>
                <div className="text-caption break-all">
                  Token (first 50 chars): {token.substring(0, 50)}...
                </div>
                <button
                  onClick={copyToken}
                  className="mt-2 px-3 py-1 text-caption bg-surface-base hover:bg-surface-float rounded border border-border-default"
                >
                  📋 Copy Full Token
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-surface-float p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <Heading variant="subsection" as="h2" className="text-text-primary">
              Manual SSE Test
            </Heading>
            <Button variant="primary" size="md" onClick={testSSEConnection} disabled={!token}>
              Test SSE Connection
            </Button>
          </div>
        </div>

        <div className="bg-surface-float p-6 rounded-lg space-y-4">
          <Heading variant="subsection" as="h2" className="text-text-primary">
            Logs
          </Heading>
          <div className="bg-surface-base p-4 rounded max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-text-muted text-body">No logs yet</div>
            ) : (
              <div className="space-y-1 text-caption font-mono">
                {logs.map((log, i) => (
                  <div key={i} className="text-text-secondary">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setLogs([])}
            className="text-body text-text-muted hover:text-text-secondary"
          >
            Clear Logs
          </button>
        </div>

        <div className="bg-surface-float p-6 rounded-lg space-y-4">
          <Heading variant="subsection" as="h2" className="text-text-primary">
            Instructions
          </Heading>
          <ol className="list-decimal list-inside space-y-2 text-body text-text-secondary">
            <li>Check if you&apos;re authenticated (should show email above)</li>
            <li>Check if token is present</li>
            <li>Click &quot;📋 Copy Full Token&quot; to copy your access token</li>
            <li>Click &quot;Test SSE Connection&quot; button</li>
            <li>Watch the logs for connection events</li>
            <li>
              Run backend test:{" "}
              <code className="bg-surface-base px-2 py-1 rounded text-caption">
                {`uv run python scripts/test_notifications_sse.py <email> <password>`}
              </code>
            </li>
          </ol>

          <div className="mt-4 p-4 bg-surface-base rounded border border-border-default">
            <Heading variant="label" as="h3" className="text-text-primary mb-2">
              🔧 Get Token from Console
            </Heading>
            <p className="text-caption text-text-secondary mb-2">
              You can also get the token from browser console (F12):
            </p>
            <code className="block text-caption bg-black/20 p-2 rounded text-text-secondary">
              window.getAccessToken()
            </code>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-lg">
          <Heading variant="label" as="h3" className="text-amber-500 mb-2">
            ⚠️ Browser Console
          </Heading>
          <p className="text-body text-text-secondary">
            Open DevTools Console (F12) to see detailed [SSE] logs from NotificationProvider
          </p>
        </div>
      </div>
    </div>
  );
}

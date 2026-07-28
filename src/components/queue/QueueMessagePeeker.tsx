"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Eye, EyeOff, RefreshCw, Copy, Check } from "lucide-react";
import { peekQueueMessage } from "@/lib/api/queue-admin";
import type { QueueStats } from "@/lib/types/queue";
import { useToast } from "@/components/ui/toast";

interface QueueMessage {
  body: string | Record<string, unknown>;
  headers?: Record<string, string>;
  timestamp?: string;
}

interface QueueMessagePeekerProps {
  queueName: string;
  stats: QueueStats;
}

export function QueueMessagePeeker({ queueName, stats }: QueueMessagePeekerProps) {
  const [message, setMessage] = useState<QueueMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const fetchMessage = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const data = await peekQueueMessage(queueName);
      if (data) {
        setMessage(data);
      } else {
        setError("Queue is empty - no messages to peek");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to peek message";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!message) return;

    try {
      const text =
        typeof message.body === "string" ? message.body : JSON.stringify(message.body, null, 2);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Message copied to clipboard");
    } catch {
      toast.error("Failed to copy message");
    }
  };

  const formatJSON = (obj: string | Record<string, unknown>) => {
    try {
      if (typeof obj === "string") {
        const parsed = JSON.parse(obj);
        return JSON.stringify(parsed, null, 2);
      }
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Peek Message
              </CardTitle>
              <CardDescription className="mt-1">
                View a sample message from the queue without removing it
              </CardDescription>
            </div>
            <Button
              onClick={fetchMessage}
              disabled={loading || stats.message_count === 0}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Peek Message
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.message_count === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-muted">
              <EyeOff className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Queue is empty - no messages to peek</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {stats.message_count.toLocaleString()} message(s) available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {message && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Message Content</CardTitle>
                <Badge variant="outline">Raw Data</Badge>
              </div>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">
                {formatJSON(message.body)}
              </pre>
            </div>

            {message.headers && Object.keys(message.headers).length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Headers</h4>
                <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                  {Object.entries(message.headers).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2 text-xs">
                      <span className="text-muted-foreground font-mono">{key}:</span>
                      <span className="font-mono flex-1 break-all">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message.timestamp && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Timestamp:</span> {message.timestamp}
                </p>
              </div>
            )}

            <div className="pt-4 border-t flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                This message is not removed from the queue. Use the peek function to inspect
                without affecting message processing.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

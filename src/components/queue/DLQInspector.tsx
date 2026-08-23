import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { QueueStats } from "@/lib/types/queue";
import { AlertTriangle, Info, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { purgeQueue } from "@/lib/api/queue-admin";
import { useToast } from "@/components/ui/toast";
import { Heading } from "@/components/ui/heading";

interface DLQInspectorProps {
  queueName: string;
  dlqStats: QueueStats;
}

export function DLQInspector({ queueName, dlqStats }: DLQInspectorProps) {
  const toast = useToast();
  const [purging, setPurging] = useState(false);

  const hasDLQMessages = dlqStats.message_count > 0;
  const dlqName = dlqStats.queue_name;

  const handlePurgeDLQ = async () => {
    if (
      !confirm(
        `Are you sure you want to purge ${dlqStats.message_count} messages from the dead-letter queue?`
      )
    ) {
      return;
    }

    setPurging(true);
    try {
      await purgeQueue(dlqName, false);
      toast.success(`Purged ${dlqStats.message_count} messages from DLQ`);
      // Trigger parent refresh by reloading the page
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to purge DLQ";
      toast.error(message);
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* DLQ Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Dead-Letter Queue
          </CardTitle>
          <CardDescription>
            Messages that failed processing are sent to this queue for investigation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-body text-muted-foreground">DLQ Name</span>
            <code className="text-body font-mono bg-muted px-2 py-1 rounded">{dlqName}</code>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-body text-muted-foreground">Failed Messages</span>
            <Badge variant={hasDLQMessages ? "destructive" : "outline"}>
              {dlqStats.message_count.toLocaleString()}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-body text-muted-foreground">Consumers</span>
            <span className="text-body font-medium">{dlqStats.consumer_count}</span>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      {hasDLQMessages ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Action Required</CardTitle>
            <CardDescription>
              There are {dlqStats.message_count} failed messages that need attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="text-body text-muted-foreground">
                Messages in the dead-letter queue have failed processing multiple times. This could
                indicate:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-body text-muted-foreground">
                <li>Malformed message payloads</li>
                <li>Bugs in the consumer service</li>
                <li>External service failures (S3, database, etc.)</li>
                <li>Configuration errors</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Heading variant="label" as="h4" className="font-medium">
                Recommended Actions
              </Heading>
              <ol className="list-decimal list-inside space-y-1 text-body text-muted-foreground">
                <li>Investigate the root cause of failures in your logs</li>
                <li>Fix the underlying issue in your worker service</li>
                <li>Consider manually reprocessing messages (requires custom tooling)</li>
                <li>Once resolved, purge the DLQ to start fresh</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="destructive" size="sm" onClick={handlePurgeDLQ} disabled={purging}>
                <Trash2 className="h-4 w-4 mr-2" />
                Purge DLQ
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-500">DLQ is Clean</CardTitle>
            <CardDescription>
              No failed messages detected - your queue is processing successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 bg-green-500/10 rounded-lg">
              <Info className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-body text-muted-foreground">
                  A clean DLQ indicates that all messages are being processed successfully without
                  repeated failures. This is the expected state for a healthy queue.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DLQ Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>DLQ Configuration</CardTitle>
          <CardDescription>How dead-letter queues work in this system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <Heading variant="label" as="h4" className="font-medium">
              Message Flow
            </Heading>
            <ol className="list-decimal list-inside space-y-1 text-caption text-muted-foreground">
              <li>Message is published to the main queue ({queueName})</li>
              <li>Consumer attempts to process the message</li>
              <li>If processing fails, message is requeued (up to N retries)</li>
              <li>After max retries, message is moved to DLQ ({dlqName})</li>
              <li>DLQ messages require manual intervention to resolve</li>
            </ol>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <Heading variant="label" as="h4" className="font-medium">
              Typical Retry Configuration
            </Heading>
            <ul className="space-y-1 text-caption text-muted-foreground">
              <li>
                <strong>Max Retries:</strong> 3 attempts
              </li>
              <li>
                <strong>Retry Delay:</strong> Exponential backoff (2s, 4s, 8s)
              </li>
              <li>
                <strong>DLQ TTL:</strong> Messages expire after 7 days
              </li>
            </ul>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-caption text-muted-foreground">
              <strong>Pro Tip:</strong> Set up monitoring alerts to notify you when DLQ message
              count exceeds 0. This allows you to respond quickly to processing issues before they
              accumulate.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Future Enhancements Note */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-caption text-muted-foreground">
            <strong>Future Enhancement:</strong> Message sampling and inspection tools will be added
            in a future release, allowing you to view actual message payloads and error details
            directly from this interface.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

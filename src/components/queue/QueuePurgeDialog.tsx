"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { ConfirmModal } from "@/components/ui/modal";
import { purgeQueue } from "@/lib/api/queue-admin";
import { useToast } from "@/lib/hooks/use-toast";
import type { QueueStats } from "@/lib/types/queue";

interface QueuePurgeDialogProps {
  queue: QueueStats;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QueuePurgeDialog({ queue, open, onOpenChange, onSuccess }: QueuePurgeDialogProps) {
  const { toast } = useToast();
  const [isPurging, setIsPurging] = useState(false);
  const [previewData, setPreviewData] = useState<{ messages: number } | null>(null);

  // Load preview when dialog opens
  useEffect(() => {
    if (open && !previewData) {
      purgeQueue(queue.queue_name, true)
        .then((result) => {
          setPreviewData({ messages: result.messages_before });
        })
        .catch((error) => {
          console.error("Failed to load preview:", error);
          toast({
            title: "Preview Failed",
            description: "Could not load queue preview",
            variant: "destructive",
          });
        });
    }
  }, [open, queue.queue_name, previewData, toast]);

  const handlePurge = async () => {
    setIsPurging(true);
    try {
      const result = await purgeQueue(queue.queue_name, false);
      toast({
        title: "Queue Purged",
        description: `Successfully deleted ${result.messages_deleted?.toLocaleString() || 0} messages`,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to purge queue:", error);
      toast({
        title: "Purge Failed",
        description: error instanceof Error ? error.message : "Failed to purge queue",
        variant: "destructive",
      });
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <ConfirmModal
      open={open}
      onClose={() => onOpenChange(false)}
      onConfirm={handlePurge}
      title="Purge Queue?"
      variant="danger"
      confirmText={isPurging ? "Purging..." : "Purge Queue"}
      loading={isPurging}
    >
      <div className="space-y-3 text-sm">
        <p className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          You are about to <strong>permanently delete all messages</strong> from:
        </p>
        <div className="p-3 bg-muted rounded-md">
          <p className="font-medium">{queue.metadata?.display_name || queue.queue_name}</p>
          <p className="text-xs text-muted-foreground mt-1">{queue.metadata?.description}</p>
        </div>
        {previewData && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md">
            <p className="text-sm font-medium text-red-900 dark:text-red-200">
              {previewData.messages.toLocaleString()} messages will be deleted
            </p>
            <p className="text-xs text-red-700 dark:text-red-400 mt-1">
              This action cannot be undone.
            </p>
          </div>
        )}
      </div>
    </ConfirmModal>
  );
}

import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/lib/api-client";

interface UseSSEOptions<T> {
  url: string;
  enabled: boolean;
  onMessage: (data: T) => void;
  onError?: (error: Error) => void;
  shouldClose?: (data: T) => boolean;
}

/**
 * Custom hook for Server-Sent Events with authentication support.
 *
 * Unused by product UI today (job status uses HTTP polling).
 * Canonical SSE status: studio-backend/docs/SSE (Server-Sent Events).md
 *
 * Since browser EventSource doesn't support custom headers, this hook
 * uses fetch with ReadableStream to implement SSE with Authorization header.
 */
export function useSSE<T>({ url, enabled, onMessage, onError, shouldClose }: UseSSEOptions<T>) {
  const [connected, setIsConnected] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  // Use refs to store callbacks to avoid recreating SSE connection when they change
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const shouldCloseRef = useRef(shouldClose);

  // Keep refs up to date
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    shouldCloseRef.current = shouldClose;
  }, [shouldClose]);

  useEffect(() => {
    if (!enabled || !url) {
      // Cleanup if disabled or no URL
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (readerRef.current) {
        readerRef.current.cancel();
        readerRef.current = null;
      }
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.error("[SSE] No access token available");
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const connectSSE = async () => {
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          credentials: "include",
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }

        setIsConnected(true);
        const reader = response.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const messages = buffer.split("\n\n");
          buffer = messages.pop() || "";

          for (const message of messages) {
            if (!message.trim()) continue;

            const lines = message.split("\n");
            let data = "";

            for (const line of lines) {
              if (line.startsWith("data:")) {
                data = line.substring(5).trim();
              }
            }

            if (data) {
              try {
                const parsed = JSON.parse(data) as T;
                onMessageRef.current(parsed);

                if (shouldCloseRef.current && shouldCloseRef.current(parsed)) {
                  reader.cancel();
                  abortController.abort();
                  break;
                }
              } catch (error) {
                console.error("[SSE] Failed to parse message:", error);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("[SSE] Connection error:", error);
          onErrorRef.current?.(error);
        }
      } finally {
        setIsConnected(false);
        readerRef.current = null;
        abortControllerRef.current = null;
      }
    };

    connectSSE();

    return () => {
      if (abortController) {
        abortController.abort();
      }
      if (readerRef.current) {
        readerRef.current.cancel().catch(() => {});
      }
    };
  }, [url, enabled]); // Only depend on url and enabled, callbacks are in refs

  return { isConnected: enabled && connected };
}

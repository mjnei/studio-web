import { useEffect, useRef, useState, useCallback } from "react";
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
 * Since browser EventSource doesn't support custom headers, this hook
 * uses fetch with ReadableStream to implement SSE with Authorization header.
 */
export function useSSE<T>({ url, enabled, onMessage, onError, shouldClose }: UseSSEOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
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
      setIsConnected(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.error("❌ No access token available for SSE connection");
      console.log("Waiting for authentication...");
      return;
    }

    console.log("✅ Access token available, proceeding with SSE connection");
    console.log(`🔌 SSE enabled: ${enabled}, URL: ${url}`);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const connectSSE = async () => {
      try {
        console.log(`🔌 Opening SSE connection to ${url}`);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          credentials: "include",
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`SSE connection failed: ${response.status} ${response.statusText}`);
          console.error(`Error details:`, errorText);
          throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }

        console.log("✅ SSE connection established successfully");
        setIsConnected(true);
        const reader = response.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log("✅ SSE stream ended normally");
            break;
          }

          // Decode chunk and add to buffer
          const chunk = decoder.decode(value, { stream: true });
          console.log("📦 SSE raw chunk received:", chunk.substring(0, 200)); // Log first 200 chars
          buffer += chunk;

          // Process complete messages (separated by \n\n)
          const messages = buffer.split("\n\n");
          buffer = messages.pop() || ""; // Keep incomplete message in buffer

          console.log(`📦 SSE processing ${messages.length} message(s)`);

          for (const message of messages) {
            if (!message.trim()) continue;

            console.log("📦 SSE raw message:", message);

            // Parse SSE message format
            const lines = message.split("\n");
            let data = "";

            for (const line of lines) {
              if (line.startsWith("data:")) {
                data = line.substring(5).trim();
              }
            }

            // Parse JSON data and call handler
            if (data) {
              try {
                const parsed = JSON.parse(data) as T;
                console.log("📨 SSE message received:", parsed);
                onMessageRef.current(parsed);

                // Check if connection should close
                if (shouldCloseRef.current && shouldCloseRef.current(parsed)) {
                  console.log("🔌 SSE stream closing (shouldClose condition met)");
                  reader.cancel();
                  abortController.abort();
                  break;
                }
              } catch (error) {
                console.error("Failed to parse SSE message:", error, "Data:", data);
              }
            } else {
              console.warn("⚠️ SSE message has no data field:", message);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            console.log("🔌 SSE connection aborted");
          } else {
            console.error("❌ SSE connection error:", error);
            onErrorRef.current?.(error);
          }
        }
      } finally {
        console.log("🧹 SSE connection cleanup");
        setIsConnected(false);
        readerRef.current = null;
        abortControllerRef.current = null;
      }
    };

    connectSSE();

    // Cleanup on unmount
    return () => {
      console.log("🔌 Cleaning up SSE connection (unmount)");
      if (abortController) {
        abortController.abort();
      }
      if (readerRef.current) {
        readerRef.current.cancel().catch(() => {
          // Ignore cancel errors during cleanup
        });
      }
    };
  }, [url, enabled]); // Only depend on url and enabled, callbacks are in refs

  return { isConnected };
}

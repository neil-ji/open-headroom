import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { StatsResponse, HealthResponse } from "@/types/api";

// ── Health (unchanged — polling is fine for infrequent health checks) ──

async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch("/health");
  if (!res.ok) throw new Error("Failed to fetch health");
  return res.json();
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

// ── Stats via SSE ──

export function useStats() {
  const [data, setData] = useState<StatsResponse | undefined>(undefined);
  const esRef = useRef<EventSource | null>(null);
  const snapshotRef = useRef<StatsResponse | undefined>(undefined);

  const connect = useCallback(() => {
    // Tear down any existing connection.
    esRef.current?.close();

    // Clear state so views show the loading indicator during reconnect.
    setData(undefined);
    snapshotRef.current = undefined;

    const es = new EventSource("/stats/stream");
    esRef.current = es;

    // Lightweight tick — merge one level deep to preserve snapshot-only
    // subfields (e.g. tokens.output_reduction) that the tick doesn't carry.
    es.addEventListener("tick", (e: MessageEvent) => {
      try {
        const tick = JSON.parse(e.data) as Record<string, unknown>;
        setData((prev) => {
          const base = snapshotRef.current ?? prev ?? {};
          const merged: Record<string, unknown> = { ...base };
          for (const key of Object.keys(tick)) {
            const src = tick[key];
            const dst = (base as Record<string, unknown>)[key];
            if (
              src !== null && typeof src === "object" && !Array.isArray(src) &&
              dst !== null && typeof dst === "object" && !Array.isArray(dst)
            ) {
              merged[key] = { ...(dst as Record<string, unknown>), ...(src as Record<string, unknown>) };
            } else {
              merged[key] = src;
            }
          }
          return merged as StatsResponse;
        });
      } catch {
        /* ignore malformed events */
      }
    });

    // Full snapshot — replace entire state.
    es.addEventListener("snapshot", (e: MessageEvent) => {
      try {
        const snapshot = JSON.parse(e.data) as StatsResponse;
        snapshotRef.current = snapshot;
        setData(snapshot);
      } catch {
        /* ignore malformed events */
      }
    });

    // EventSource auto-reconnects on error.  Keep last-known data so the
    // UI doesn't flicker; the next snapshot event will replace it.
    es.onerror = () => {
      // No action needed — browser handles reconnection.
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  return { data, reconnect };
}

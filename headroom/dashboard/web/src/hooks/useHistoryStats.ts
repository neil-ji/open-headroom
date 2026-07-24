import { useQuery } from "@tanstack/react-query";
import type { HistoryStatsResponse } from "@/types/api";

async function fetchHistoryStats(): Promise<HistoryStatsResponse> {
  const res = await fetch("/stats-history");
  if (!res.ok) throw new Error("Failed to fetch history stats");
  return res.json();
}

export function useHistoryStats(enabled: boolean) {
  return useQuery({
    queryKey: ["historyStats"],
    queryFn: fetchHistoryStats,
    refetchInterval: enabled ? 30000 : false,
    staleTime: 15000,
    enabled,
  });
}

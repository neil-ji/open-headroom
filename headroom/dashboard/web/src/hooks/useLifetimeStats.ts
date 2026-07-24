import { useQuery } from "@tanstack/react-query";
import type { LifetimeStatsResponse } from "@/types/api";

async function fetchLifetimeStats(): Promise<LifetimeStatsResponse> {
  const res = await fetch("/stats-lifetime");
  if (!res.ok) throw new Error("Failed to fetch lifetime stats");
  return res.json();
}

export function useLifetimeStats(enabled: boolean) {
  return useQuery({
    queryKey: ["lifetimeStats"],
    queryFn: fetchLifetimeStats,
    refetchInterval: enabled ? 30000 : false,
    staleTime: 15000,
    enabled,
  });
}

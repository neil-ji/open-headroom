import { useQuery } from "@tanstack/react-query";
import type { StatsResponse, HealthResponse } from "@/types/api";

async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch("/stats?cached=1");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch("/health");
  if (!res.ok) throw new Error("Failed to fetch health");
  return res.json();
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 5000,
    staleTime: 3000,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

import { useQuery } from "@tanstack/react-query";
import type { TransformationFeed } from "@/types/api";

async function fetchTransformations(): Promise<TransformationFeed> {
  const res = await fetch("/transformations/feed?limit=50");
  if (!res.ok) throw new Error("Failed to fetch transformations");
  return res.json();
}

export function useTransformations(enabled: boolean) {
  return useQuery({
    queryKey: ["transformations"],
    queryFn: fetchTransformations,
    refetchInterval: enabled ? 5000 : false,
    staleTime: 3000,
    enabled,
  });
}

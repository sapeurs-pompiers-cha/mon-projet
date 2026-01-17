import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertAgent } from "../lib/routes";

export function useAgents(filters?: { search?: string; rank?: string }) {
  return useQuery({
    queryKey: [api.agents.list.path, filters],
    queryFn: async () => {
      // Build query string manually or use URLSearchParams
      const url = new URL(api.agents.list.path, window.location.origin);
      if (filters?.search) url.searchParams.append("search", filters.search);
      if (filters?.rank && filters.rank !== "all") url.searchParams.append("rank", filters.rank);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch agents");
      return api.agents.list.responses[200].parse(await res.json());
    },
  });
}

export function useAgent(id: number) {
  return useQuery({
    queryKey: [api.agents.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.agents.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch agent details");
      return api.agents.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAgent) => {
      const res = await fetch(api.agents.create.path, {
        method: api.agents.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.agents.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create agent");
      }
      return api.agents.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.agents.list.path] });
    },
  });
}

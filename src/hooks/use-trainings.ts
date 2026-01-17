import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/routes";
import { type InsertTraining, type InsertParticipation } from "../lib/schema";

export function useTrainings() {
  return useQuery({
    queryKey: [api.trainings.list.path],
    queryFn: async () => {
      const res = await fetch(api.trainings.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch trainings");
      return api.trainings.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTraining) => {
      const res = await fetch(api.trainings.create.path, {
        method: api.trainings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.trainings.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create training");
      }
      return api.trainings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trainings.list.path] });
    },
  });
}

export function useCreateParticipation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertParticipation) => {
      const res = await fetch(api.participations.create.path, {
        method: api.participations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.participations.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to add participation");
      }
      return api.participations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate both lists so stats update
      queryClient.invalidateQueries({ queryKey: [api.agents.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.agents.get.path] });
    },
  });
}

export function useUpdateTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: InsertTraining & { id: number }) => {
      const res = await fetch(`/api/trainings/${id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to update training");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trainings.list.path] });
    },
  });
}

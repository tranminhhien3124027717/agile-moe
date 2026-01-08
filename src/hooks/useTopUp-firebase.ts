import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  topUpRulesService,
  topUpSchedulesService,
} from "@/lib/firestoreServices";
import { toast } from "sonner";
import type { TopUpRule, TopUpSchedule } from "@/types/firestore";

export { type TopUpRule, type TopUpSchedule } from "@/types/firestore";

// Top-up Rules
export function useTopUpRules() {
  return useQuery({
    queryKey: ["top_up_rules"],
    queryFn: async () => {
      const data = await topUpRulesService.getAll();
      return data;
    },
  });
}

export function useTopUpRule(id: string | undefined) {
  return useQuery({
    queryKey: ["top_up_rules", id],
    queryFn: async () => {
      if (!id) return null;
      const data = await topUpRulesService.getById(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTopUpRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<TopUpRule, "id" | "createdAt" | "updatedAt">
    ) => {
      return await topUpRulesService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["top_up_rules"] });
      toast.success("Top-up rule created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create rule: ${error.message}`);
    },
  });
}

export function useUpdateTopUpRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TopUpRule>;
    }) => {
      await topUpRulesService.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["top_up_rules"] });
      queryClient.invalidateQueries({
        queryKey: ["top_up_rules", variables.id],
      });
      toast.success("Top-up rule updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update rule: ${error.message}`);
    },
  });
}

export function useDeleteTopUpRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await topUpRulesService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["top_up_rules"] });
      toast.success("Top-up rule deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete rule: ${error.message}`);
    },
  });
}

// Top-up Schedules
export function useTopUpSchedules() {
  return useQuery({
    queryKey: ["top_up_schedules"],
    queryFn: async () => {
      const data = await topUpSchedulesService.getAll();
      return data;
    },
  });
}

export function useCreateTopUpSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<TopUpSchedule, "id" | "createdAt" | "updatedAt">
    ) => {
      return await topUpSchedulesService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["top_up_schedules"] });
      toast.success("Top-up scheduled successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to schedule top-up: ${error.message}`);
    },
  });
}

export function useExecuteTopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      await topUpSchedulesService.executeTopUp(scheduleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["top_up_schedules"] });
      queryClient.invalidateQueries({ queryKey: ["account_holders"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Top-up executed successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to execute top-up: ${error.message}`);
    },
  });
}

export function useDeleteTopUpSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // For now, we'll just update status to cancelled instead of deleting
      await topUpSchedulesService.update(id, {
        status: "failed",
        remarks: "Cancelled by admin",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["top_up_schedules"] });
      toast.success("Schedule cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to cancel schedule: ${error.message}`);
    },
  });
}

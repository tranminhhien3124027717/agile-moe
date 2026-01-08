import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseChargesService } from "@/lib/firestoreServices";
import { toast } from "sonner";
import type { CourseCharge } from "@/types/firestore";

export { type CourseCharge } from "@/types/firestore";

export function useCourseCharges() {
  return useQuery({
    queryKey: ["course_charges"],
    queryFn: async () => {
      const data = await courseChargesService.getAll();
      return data;
    },
  });
}

export function useCourseChargesByAccount(accountId: string | undefined) {
  return useQuery({
    queryKey: ["course_charges", "account", accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const data = await courseChargesService.getByAccountId(accountId);
      return data;
    },
    enabled: !!accountId,
  });
}

export function useCreateCourseCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<CourseCharge, "id" | "createdAt" | "updatedAt">
    ) => {
      return await courseChargesService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course_charges"] });
      toast.success("Course charge created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create course charge: ${error.message}`);
    },
  });
}

export function usePayCourseCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      paymentMethod,
    }: {
      id: string;
      paymentMethod: "education_account" | "online";
    }) => {
      await courseChargesService.payCharge(id, paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course_charges"] });
      queryClient.invalidateQueries({ queryKey: ["account_holders"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Payment successful");
    },
    onError: (error: any) => {
      toast.error(`Payment failed: ${error.message}`);
    },
  });
}

export function useUpdateCourseCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string } & Partial<CourseCharge>) => {
      await courseChargesService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course_charges"] });
      toast.success("Course charge updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update course charge: ${error.message}`);
    },
  });
}

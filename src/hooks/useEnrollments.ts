import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  enrollmentsService,
  coursesService,
  accountHoldersService,
} from "@/lib/firestoreServices";
import { toast } from "sonner";
import type { Enrollment, Course } from "@/types/firestore";

export { type Enrollment } from "@/types/firestore";

export interface EnrollmentWithDetails extends Enrollment {
  courseName?: string;
  accountName?: string;
  course?: Course; // Full course object for detailed info
}

export function useEnrollments() {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const enrollments = await enrollmentsService.getAll();

      // Fetch related data
      const courses = await coursesService.getAll();
      const accounts = await accountHoldersService.getAll();

      const coursesMap = new Map(courses.map((c) => [c.id, c]));
      const accountsMap = new Map(accounts.map((a) => [a.id, a]));

      return enrollments.map((e) => ({
        ...e,
        courseName: coursesMap.get(e.courseId)?.name,
        accountName: accountsMap.get(e.accountId)?.name,
      })) as EnrollmentWithDetails[];
    },
  });
}

export function useEnrollmentsByAccount(accountId: string | undefined) {
  return useQuery({
    queryKey: ["enrollments", "account", accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const enrollments = await enrollmentsService.getByAccountId(accountId);

      // Fetch course details
      const courses = await coursesService.getAll();
      const coursesMap = new Map(courses.map((c) => [c.id, c]));

      return enrollments.map((e) => ({
        ...e,
        courseName: coursesMap.get(e.courseId)?.name,
        course: coursesMap.get(e.courseId), // Include full course object
      })) as EnrollmentWithDetails[];
    },
    enabled: !!accountId,
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh data
  });
}

export function useEnrollmentsByCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ["enrollments", "course", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const enrollments = await enrollmentsService.getByCourseId(courseId);

      // Fetch account details
      const accounts = await accountHoldersService.getAll();
      const accountsMap = new Map(accounts.map((a) => [a.id, a]));

      return enrollments.map((e) => ({
        ...e,
        accountName: accountsMap.get(e.accountId)?.name,
      })) as EnrollmentWithDetails[];
    },
    enabled: !!courseId,
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<Enrollment, "id" | "createdAt" | "updatedAt">
    ) => {
      return await enrollmentsService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("Enrollment created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create enrollment: ${error.message}`);
    },
  });
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Enrollment>;
    }) => {
      await enrollmentsService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("Enrollment updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update enrollment: ${error.message}`);
    },
  });
}

export function useDeleteEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await enrollmentsService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("Enrollment deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete enrollment: ${error.message}`);
    },
  });
}

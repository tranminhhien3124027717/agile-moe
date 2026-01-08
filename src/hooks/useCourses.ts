import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '@/lib/firestoreServices';
import { toast } from 'sonner';
import type { Course } from '@/types/firestore';

export { type Course } from '@/types/firestore';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const data = await coursesService.getAll();
      return data;
    },
  });
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: async () => {
      if (!id) return null;
      const data = await coursesService.getById(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await coursesService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create course: ${error.message}`);
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Course> }) => {
      await coursesService.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
      toast.success('Course updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update course: ${error.message}`);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await coursesService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete course: ${error.message}`);
    },
  });
}

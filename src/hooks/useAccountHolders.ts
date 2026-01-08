import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountHoldersService } from '@/lib/firestoreServices';
import { toast } from 'sonner';
import type { AccountHolder } from '@/types/firestore';

export { type AccountHolder } from '@/types/firestore';

export function useAccountHolders() {
  return useQuery({
    queryKey: ['account_holders'],
    queryFn: async () => {
      const data = await accountHoldersService.getAll();
      return data;
    },
  });
}

export function useAccountHolder(id: string | undefined) {
  return useQuery({
    queryKey: ['account_holders', id],
    queryFn: async () => {
      if (!id) return null;
      const data = await accountHoldersService.getById(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateAccountHolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<AccountHolder, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await accountHoldersService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account_holders'] });
      toast.success('Account created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create account: ${error.message}`);
    },
  });
}

export function useUpdateAccountHolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AccountHolder> }) => {
      await accountHoldersService.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['account_holders'] });
      queryClient.invalidateQueries({ queryKey: ['account_holders', variables.id] });
      toast.success('Account updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update account: ${error.message}`);
    },
  });
}

export function useDeleteAccountHolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await accountHoldersService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account_holders'] });
      toast.success('Account deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete account: ${error.message}`);
    },
  });
}

export function useSearchAccountHolders(filters: {
  status?: string;
  inSchool?: string;
  searchTerm?: string;
}) {
  return useQuery({
    queryKey: ['account_holders', 'search', filters],
    queryFn: async () => {
      const data = await accountHoldersService.search(filters);
      return data;
    },
  });
}

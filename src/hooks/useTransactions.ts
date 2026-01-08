import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsService } from "@/lib/firestoreServices";
import { toast } from "sonner";
import type { Transaction } from "@/types/firestore";

export { type Transaction } from "@/types/firestore";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const data = await transactionsService.getAll();
      return data;
    },
  });
}

export function useTransactionsByAccount(accountId: string | undefined) {
  return useQuery({
    queryKey: ["transactions", "account", accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const data = await transactionsService.getByAccountId(accountId);
      return data;
    },
    enabled: !!accountId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Transaction, "id" | "createdAt">) => {
      return await transactionsService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["account_holders"] });
      toast.success("Transaction created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create transaction: ${error.message}`);
    },
  });
}

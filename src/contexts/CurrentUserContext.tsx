import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAccountHolders } from "@/hooks/useAccountHolders";
import type { AccountHolder } from "@/types/firestore";

interface CurrentUserContextType {
  currentUserId: string | null;
  currentUser: AccountHolder | null;
  setCurrentUserId: (id: string) => void;
  isLoading: boolean;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(
  undefined
);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { data: accountHolders = [], isLoading } = useAccountHolders();

  // Auto-select first active account holder when data loads
  useEffect(() => {
    if (!isLoading && accountHolders.length > 0 && !currentUserId) {
      const activeAccounts = accountHolders.filter(
        (a) => a.status === "active"
      );
      if (activeAccounts.length > 0) {
        setCurrentUserId(activeAccounts[0].id);
      }
    }
  }, [accountHolders, isLoading, currentUserId]);

  const currentUser = currentUserId
    ? accountHolders.find((a) => a.id === currentUserId) || null
    : null;

  return (
    <CurrentUserContext.Provider
      value={{ currentUserId, currentUser, setCurrentUserId, isLoading }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
}

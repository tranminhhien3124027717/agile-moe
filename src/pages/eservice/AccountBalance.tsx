import { useState } from "react";
import {
  Search,
  Download,
  Filter,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransactionsByAccount, Transaction } from "@/hooks/useTransactions";
import { useCurrentUser } from "@/contexts/CurrentUserContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AccountBalance() {
  const { currentUser, isLoading: loadingUser } = useCurrentUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: transactions = [], isLoading: loadingTransactions } =
    useTransactionsByAccount(currentUser?.id || "");

  if (loadingUser || loadingTransactions || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Calculate total top-ups received
  const totalTopUps = transactions
    .filter((t) => t.type === "top_up" && t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate total fees paid
  const totalFeesPaid = transactions
    .filter((t) => t.type === "course_fee" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate running balance for each transaction (oldest to newest, then reverse)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let runningBalance =
    Number(currentUser.balance) -
    sortedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const transactionsWithBalance = sortedTransactions.map((t) => {
    runningBalance += Number(t.amount);
    return { ...t, balanceAfter: runningBalance };
  });

  // Reverse to show newest first
  const displayTransactions = [...transactionsWithBalance].reverse();

  const columns = [
    {
      key: "created_at",
      header: "Date",
      render: (item: Transaction & { balanceAfter: number }) => (
        <span className="text-foreground">
          {new Date(item.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item: Transaction & { balanceAfter: number }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
          {item.type.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (item: Transaction & { balanceAfter: number }) => (
        <div>
          <p className="font-medium text-foreground">
            {item.description || "—"}
          </p>
          {item.reference && (
            <p className="text-xs text-muted-foreground">{item.reference}</p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (item: Transaction & { balanceAfter: number }) => (
        <span
          className={`font-semibold ${
            Number(item.amount) >= 0 ? "text-success" : "text-destructive"
          }`}
        >
          {Number(item.amount) >= 0 ? "+" : "-"}$
          {Math.abs(Number(item.amount)).toFixed(2)}
        </span>
      ),
    },
    {
      key: "balanceAfter",
      header: "Balance",
      render: (item: Transaction & { balanceAfter: number }) => (
        <span className="font-medium text-foreground">
          ${item.balanceAfter.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Account Balance
          </h1>
          <p className="text-muted-foreground mt-1">
            View your education account balance and transactions
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl gradient-hero p-8 text-primary-foreground">
        <p className="text-sm opacity-90">Current Balance</p>
        <p className="text-5xl font-bold mt-2">
          ${Number(currentUser.balance).toFixed(2)}
        </p>
        <p className="text-sm opacity-75 mt-2">
          Available for course fees and payments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <ArrowUpRight className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Top-ups Received
              </p>
              <p className="text-2xl font-bold text-foreground">
                ${totalTopUps.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Credits from government schemes
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Fees Paid
              </p>
              <p className="text-2xl font-bold text-foreground">
                ${totalFeesPaid.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Course fees deducted
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Transaction History
        </h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="top_up">Top Up</SelectItem>
              <SelectItem value="course_fee">Course Fee</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        <DataTable
          data={displayTransactions}
          columns={columns}
          emptyMessage="No transactions found"
        />
      </div>

      {/* Info */}
      <div className="rounded-xl border border-border bg-muted/30 p-6">
        <h3 className="font-semibold text-foreground mb-2">
          About Your Balance
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            • Your balance is automatically topped up based on government
            schemes
          </li>
          <li>• Funds can be used to pay for approved education courses</li>
          <li>
            • Unused balance will be forfeited when account closes at age 30
          </li>
          <li>• Balance cannot be withdrawn as cash</li>
        </ul>
      </div>
    </div>
  );
}

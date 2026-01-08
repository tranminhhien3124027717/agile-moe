import {
  Wallet,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  CircleDollarSign,
  Users,
  User,
} from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { useTopUpSchedules } from "@/hooks/useTopUpSchedules";
import { useCourseCharges } from "@/hooks/useCourseCharges";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccountHolders } from "@/hooks/useAccountHolders";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { data: topUpSchedules = [], isLoading: loadingSchedules } =
    useTopUpSchedules();
  const { data: courseCharges = [], isLoading: loadingCharges } =
    useCourseCharges();
  const { data: transactions = [], isLoading: loadingTransactions } =
    useTransactions();
  const { data: accountHolders = [], isLoading: loadingAccounts } =
    useAccountHolders();

  // Filter all upcoming/scheduled top-ups
  const upcomingTopUps = topUpSchedules
    .filter((s) => s.status === "scheduled" || s.status === "processing")
    .sort((a, b) => {
      const dateA = new Date(
        `${a.scheduledDate}T${a.scheduledTime || "00:00"}`
      );
      const dateB = new Date(
        `${b.scheduledDate}T${b.scheduledTime || "00:00"}`
      );
      return dateA.getTime() - dateB.getTime();
    });

  // Calculate totals from course charges
  const totalCollected = courseCharges
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const outstandingPayments = courseCharges
    .filter((c) => c.status === "pending" || c.status === "overdue")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  // Calculate total disbursed from transactions (top_up type)
  const totalDisbursed = transactions
    .filter((t) => t.type === "top_up" && t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Recent batch and individual schedules for tracking tabs
  const recentBatchSchedules = [...topUpSchedules]
    .filter((s) => s.type === "batch")
    .sort(
      (a, b) =>
        new Date(b.scheduledDate).getTime() -
        new Date(a.scheduledDate).getTime()
    )
    .slice(0, 8);

  const recentIndividualSchedules = [...topUpSchedules]
    .filter((s) => s.type === "individual")
    .sort(
      (a, b) =>
        new Date(b.scheduledDate).getTime() -
        new Date(a.scheduledDate).getTime()
    )
    .slice(0, 8);

  const batchScheduleColumns = [
    {
      key: "ruleName",
      header: "Rule Name",
      render: (item: (typeof topUpSchedules)[0]) => (
        <div>
          <p className="font-medium text-foreground">{item.ruleName}</p>
          {item.eligibleCount && (
            <p className="text-xs text-muted-foreground">
              {item.eligibleCount} accounts
            </p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (item: (typeof topUpSchedules)[0]) => (
        <span className="font-semibold text-success">
          ${Number(item.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "scheduledDate",
      header: "Scheduled",
      render: (item: (typeof topUpSchedules)[0]) => (
        <div className="text-muted-foreground text-sm">
          <p>{new Date(item.scheduledDate).toLocaleDateString()}</p>
          {item.scheduledTime && (
            <p className="text-xs">{item.scheduledTime}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Top up Status",
      render: (item: (typeof topUpSchedules)[0]) => (
        <StatusBadge
          status={item.status === "failed" ? "canceled" : item.status}
        />
      ),
    },
  ];

  const individualScheduleColumns = [
    {
      key: "name",
      header: "Name",
      render: (item: (typeof topUpSchedules)[0]) => (
        <div>
          <p className="font-medium text-foreground">{item.accountName}</p>
          {item.remarks && (
            <p className="text-xs text-muted-foreground">{item.remarks}</p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (item: (typeof topUpSchedules)[0]) => (
        <span className="font-semibold text-success">
          ${Number(item.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "scheduledDate",
      header: "Scheduled",
      render: (item: (typeof topUpSchedules)[0]) => (
        <div className="text-muted-foreground text-sm">
          <p>{new Date(item.scheduledDate).toLocaleDateString()}</p>
          {item.scheduledTime && (
            <p className="text-xs">{item.scheduledTime}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Top up Status",
      render: (item: (typeof topUpSchedules)[0]) => (
        <StatusBadge
          status={item.status === "failed" ? "canceled" : item.status}
        />
      ),
    },
  ];

  if (
    loadingSchedules ||
    loadingCharges ||
    loadingTransactions ||
    loadingAccounts
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of education account system
          </p>
        </div>
      </div>

      {/* Financial Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Disbursed"
          value={`$${totalDisbursed.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          icon={ArrowUpRight}
          variant="success"
        />
        <StatCard
          title="Total Collected"
          value={`$${totalCollected.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          icon={ArrowDownRight}
          variant="primary"
        />
        <StatCard
          title="Outstanding Payments"
          value={`$${outstandingPayments.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          icon={CircleDollarSign}
          variant="warning"
        />
      </div>

      {/* Top-up Tracking */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-accent" />
              <div>
                <CardTitle>Top-up Tracking</CardTitle>
                <CardDescription>
                  Monitor scheduled and completed top-ups
                </CardDescription>
              </div>
            </div>
            <Link to="/admin/topup">
              <Button variant="outline" size="sm">
                View All →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* Scheduled Count */}
          <div className="rounded-lg bg-accent/10 p-4 mb-6">
            <p className="text-4xl font-bold text-foreground">
              {upcomingTopUps.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled top-ups
            </p>
          </div>

          <Tabs defaultValue="batch" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="batch" className="gap-2">
                <Users className="h-4 w-4" />
                Batch
              </TabsTrigger>
              <TabsTrigger value="individual" className="gap-2">
                <User className="h-4 w-4" />
                Individual
              </TabsTrigger>
            </TabsList>
            <TabsContent value="batch">
              <DataTable
                data={recentBatchSchedules}
                columns={batchScheduleColumns}
                emptyMessage="No batch top-up history"
              />
            </TabsContent>
            <TabsContent value="individual">
              <DataTable
                data={recentIndividualSchedules}
                columns={individualScheduleColumns}
                emptyMessage="No individual top-up history"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

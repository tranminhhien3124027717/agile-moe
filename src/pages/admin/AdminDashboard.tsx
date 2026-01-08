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

  const recentSchedules = [...topUpSchedules]
    .sort(
      (a, b) =>
        new Date(b.scheduledDate).getTime() -
        new Date(a.scheduledDate).getTime()
    )
    .slice(0, 8);

  const scheduleColumns = [
    {
      key: "type",
      header: "Type",
      render: (item: (typeof topUpSchedules)[0]) => (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            item.type === "batch"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-accent/10 text-accent border border-accent/20"
          }`}
        >
          {item.type === "batch" ? (
            <Users className="h-3.5 w-3.5" />
          ) : (
            <User className="h-3.5 w-3.5" />
          )}
          {item.type === "batch" ? "Batch" : "Individual"}
        </div>
      ),
    },
    {
      key: "details",
      header: "Details",
      render: (item: (typeof topUpSchedules)[0]) => (
        <div>
          <p className="font-medium text-foreground">
            {item.type === "batch" ? item.ruleName : item.accountName}
          </p>
          {item.type === "batch" && item.eligibleCount && (
            <p className="text-xs text-muted-foreground">
              {item.eligibleCount} accounts
            </p>
          )}
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
      header: "Status",
      render: (item: (typeof topUpSchedules)[0]) => (
        <StatusBadge status={item.status} />
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
        <div className="flex gap-3">
          <Link to="/admin/topup">
            <Button variant="accent">
              <Wallet className="h-4 w-4 mr-2" />
              Manage Top-ups
            </Button>
          </Link>
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

      {/* Upcoming Top-ups (Next 30 Days) */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-foreground">Upcoming Top-ups</h3>
          </div>
          <Link to="/admin/topup">
            <Button variant="ghost" size="sm">
              View all →
            </Button>
          </Link>
        </div>

        {/* Total Count */}
        <div className="rounded-lg bg-accent/10 p-4 mb-4">
          <p className="text-4xl font-bold text-foreground">
            {upcomingTopUps.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Scheduled top-ups
          </p>
        </div>

        {/* Details List */}
        {upcomingTopUps.length > 0 ? (
          <div className="space-y-3">
            {upcomingTopUps.slice(0, 5).map((topUp) => (
              <div
                key={topUp.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      topUp.type === "batch"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-accent/10 text-accent border border-accent/20"
                    }`}
                  >
                    {topUp.type === "batch" ? (
                      <Users className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                    {topUp.type === "batch" ? "Batch" : "Individual"}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {topUp.type === "batch"
                        ? topUp.ruleName
                        : topUp.accountName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topUp.type === "batch"
                        ? `${topUp.eligibleCount} eligible accounts`
                        : topUp.remarks}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success">
                    ${Number(topUp.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(topUp.scheduledDate).toLocaleDateString()}
                    {topUp.scheduledTime && ` at ${topUp.scheduledTime}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No upcoming top-ups scheduled
          </p>
        )}
      </div>

      {/* Top-up History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top-up History</CardTitle>
              <CardDescription>Recent top-up operations</CardDescription>
            </div>
            <Link to="/admin/topup">
              <Button variant="outline" size="sm">
                View All →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={recentSchedules}
            columns={scheduleColumns}
            emptyMessage="No top-up history"
          />
        </CardContent>
      </Card>
    </div>
  );
}

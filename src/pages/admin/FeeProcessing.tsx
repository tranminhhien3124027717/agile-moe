import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCourseCharges } from "@/hooks/useCourseCharges";
import { useAccountHolders } from "@/hooks/useAccountHolders";
import { toast } from "sonner";

export default function FeeProcessing() {
  const { data: courseCharges = [], isLoading: loadingCharges } =
    useCourseCharges();
  const { data: accountHolders = [] } = useAccountHolders();

  const pendingCharges = courseCharges.filter((c) => c.status === "pending");
  const outstandingCharges = courseCharges.filter(
    (c) => c.status === "outstanding"
  );
  const clearCharges = courseCharges.filter((c) => c.status === "paid");

  const totalPending = pendingCharges.reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );
  const totalOutstanding = outstandingCharges.reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );

  const handleProcessFees = () => {
    toast.success("Monthly fee processing initiated", {
      description: "Processing course fees for all enrolled students.",
    });
  };

  const handleSendReminder = () => {
    toast.success("Payment reminders sent", {
      description: `Reminders sent to ${outstandingCharges.length} account holders.`,
    });
  };

  const chargeColumns = [
    {
      key: "student",
      header: "Student",
      render: (item: (typeof courseCharges)[0]) => {
        const student = accountHolders.find((a) => a.id === item.accountId);
        return student ? (
          <div>
            <p className="font-medium text-foreground">{student.name}</p>
            <p className="text-xs text-muted-foreground">{student.nric}</p>
          </div>
        ) : null;
      },
    },
    {
      key: "courseName",
      header: "Course",
      render: (item: (typeof courseCharges)[0]) => (
        <span className="text-foreground">{item.courseName}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (item: (typeof courseCharges)[0]) => (
        <span className="font-semibold text-foreground">
          ${Number(item.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (item: (typeof courseCharges)[0]) => (
        <span className="text-muted-foreground">
          {new Date(item.dueDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: (typeof courseCharges)[0]) => (
        <StatusBadge status={item.status} />
      ),
    },
    {
      key: "paymentMethod",
      header: "Payment Method",
      render: (item: (typeof courseCharges)[0]) =>
        item.paymentMethod ? (
          <span className="text-xs text-muted-foreground capitalize">
            {item.paymentMethod.replace("_", " ")}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  if (loadingCharges) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading fee data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fee Processing</h1>
          <p className="text-muted-foreground mt-1">
            Calculate and manage monthly course fee charges
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSendReminder}>
            Send Reminders
          </Button>
          <Button variant="accent" onClick={handleProcessFees}>
            <Calendar className="h-4 w-4 mr-2" />
            Process Monthly Fees
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Pending Fees"
          value={`$${totalPending.toFixed(2)}`}
          subtitle={`${pendingCharges.length} charges`}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Outstanding Fees"
          value={`$${totalOutstanding.toFixed(2)}`}
          subtitle={`${outstandingCharges.length} charges`}
          icon={AlertTriangle}
          variant="default"
        />
        <StatCard
          title="Collected This Month"
          value={`$${clearCharges
            .reduce((sum, c) => sum + Number(c.amount), 0)
            .toFixed(2)}`}
          subtitle={`${clearCharges.length} payments`}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Total Due"
          value={`$${(totalPending + totalOutstanding).toFixed(2)}`}
          subtitle="To be collected"
          icon={CreditCard}
          variant="primary"
        />
      </div>

      {/* Info Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-2">
          Monthly Fee Calculation
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Course fees are calculated based on each student's active enrollments.
          The system automatically generates charges at the beginning of each
          month.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Step 1</p>
            <p className="text-sm font-medium text-foreground">
              Check Enrollments
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              System identifies all active course enrollments
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Step 2</p>
            <p className="text-sm font-medium text-foreground">
              Calculate Fees
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly fees computed based on course pricing
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Step 3</p>
            <p className="text-sm font-medium text-foreground">
              Generate Charges
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Charges created and linked to student accounts
            </p>
          </div>
        </div>
      </div>

      {/* Charges Table */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          All Course Charges
        </h2>
        <DataTable
          data={courseCharges}
          columns={chargeColumns}
          emptyMessage="No course charges found"
        />
      </div>
    </div>
  );
}

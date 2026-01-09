import { Wallet, BookOpen, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useCourseCharges } from "@/hooks/useCourseCharges";
import { useEnrollmentsByAccount } from "@/hooks/useEnrollments";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/contexts/CurrentUserContext";

export default function EServiceDashboard() {
  const { currentUser, isLoading: loadingUser } = useCurrentUser();

  // Fetch data from database
  const { data: courseCharges = [] } = useCourseCharges();

  const { data: enrollments = [], isLoading: loadingEnrollments } =
    useEnrollmentsByAccount(currentUser?.id || "");

  if (loadingUser || loadingEnrollments || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const pendingCharges = courseCharges.filter(
    (c) => c.accountId === currentUser.id && c.status !== "paid"
  );
  const activeEnrollments = enrollments.filter((e) => e.status === "active");

  const outstandingAmount = pendingCharges.reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );

  // Calculate next payment date based on billing cycle
  const calculateNextPaymentDate = (
    enrollmentDate: string,
    billingCycle: string
  ): Date => {
    const enrolled = new Date(enrollmentDate);
    const today = new Date();
    let nextPayment = new Date(enrolled);

    const cycleMonths: Record<string, number> = {
      monthly: 1,
      quarterly: 3,
      biannually: 6,
      yearly: 12,
    };

    const months = cycleMonths[billingCycle] || 1;

    // Find the next payment date after today
    while (nextPayment <= today) {
      nextPayment.setMonth(nextPayment.getMonth() + months);
    }

    return nextPayment;
  };

  // Prepare course data for table - use embedded course data from enrollment
  const courseData = activeEnrollments
    .map((enrollment) => {
      const course = enrollment.course;
      if (!course) return null;

      const nextPaymentDate = calculateNextPaymentDate(
        enrollment.enrollmentDate,
        course.billingCycle
      );

      // Get charges for this course
      const userCharges = courseCharges.filter(
        (c) => c.accountId === currentUser.id && c.courseId === course.id
      );
      const totalFee = userCharges.reduce(
        (sum, c) => sum + Number(c.amount),
        0
      );
      const totalCollected = userCharges
        .filter((c) => c.status === "paid")
        .reduce((sum, c) => sum + Number(c.amount), 0);

      // Determine payment status based on charge statuses and due dates
      // Logic:
      // - scheduled: Current period paid, waiting for next period (no unpaid charges, course ongoing)
      // - outstanding: Current period unpaid (has pending or outstanding charges)
      // - fully_paid: All charges paid and course ended (no future charges)

      const today = new Date();
      const hasUnpaid = userCharges.some(
        (c) => c.status === "outstanding" || c.status === "pending"
      );
      const allPaid =
        userCharges.length > 0 && userCharges.every((c) => c.status === "paid");

      // Check if course has ended
      const courseEndDate = course.courseRunEnd
        ? new Date(course.courseRunEnd)
        : null;
      const courseEnded = courseEndDate && courseEndDate < today;

      let paymentStatus: "scheduled" | "outstanding" | "fully_paid" =
        "scheduled";

      if (hasUnpaid) {
        // Has unpaid charges (pending or outstanding) → Outstanding
        paymentStatus = "outstanding";
      } else if (allPaid && courseEnded) {
        // All paid AND course has ended → Fully Paid (no more charges)
        paymentStatus = "fully_paid";
      } else if (allPaid) {
        // All current charges paid, course ongoing → Scheduled (waiting for next period)
        paymentStatus = "scheduled";
      }
      // If no charges yet, default to "scheduled" (awaiting first charge)

      return {
        id: enrollment.id,
        courseId: course.id,
        name: course.name,
        provider: course.provider,
        billingCycle: course.billingCycle,
        totalFee,
        totalCollected,
        enrollmentDate: enrollment.enrollmentDate,
        nextPaymentDate,
        paymentStatus,
      };
    })
    .filter(Boolean) as {
    id: string;
    courseId: string;
    name: string;
    provider: string;
    billingCycle: string;
    totalFee: number;
    totalCollected: number;
    enrollmentDate: string;
    nextPaymentDate: Date;
    paymentStatus: "scheduled" | "outstanding" | "fully_paid";
  }[];

  const billingCycleLabels: Record<string, string> = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    biannually: "Bi-annually",
    yearly: "Yearly",
  };

  const courseColumns = [
    {
      key: "name",
      header: "Course Name",
      render: (item: (typeof courseData)[0]) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.provider}</p>
        </div>
      ),
    },
    {
      key: "billingCycle",
      header: "Billing Cycle",
      render: (item: (typeof courseData)[0]) => (
        <span className="text-muted-foreground">
          {billingCycleLabels[item.billingCycle] || item.billingCycle}
        </span>
      ),
    },
    {
      key: "totalFee",
      header: "Total Fee",
      render: (item: (typeof courseData)[0]) => (
        <span className="font-semibold text-foreground">
          ${item.totalFee.toFixed(2)}
        </span>
      ),
    },
    {
      key: "collected",
      header: "Collected",
      render: (item: (typeof courseData)[0]) => (
        <span className="font-semibold text-success">
          ${item.totalCollected.toFixed(2)}
        </span>
      ),
    },
    {
      key: "enrollmentDate",
      header: "Enrolled Date",
      render: (item: (typeof courseData)[0]) => (
        <span className="text-muted-foreground">
          {new Date(item.enrollmentDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "nextPayment",
      header: "Next Payment",
      render: (item: (typeof courseData)[0]) => {
        const daysUntil = Math.ceil(
          (item.nextPaymentDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const isUpcoming = daysUntil <= 7;

        return (
          <div>
            <p
              className={`font-medium ${
                isUpcoming ? "text-warning" : "text-foreground"
              }`}
            >
              {item.nextPaymentDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {daysUntil === 0
                ? "Today"
                : daysUntil === 1
                ? "Tomorrow"
                : `In ${daysUntil} days`}
            </p>
          </div>
        );
      },
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      render: (item: (typeof courseData)[0]) => (
        <StatusBadge status={item.paymentStatus} />
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="rounded-xl gradient-hero p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">
          Welcome back, {currentUser.name.split(" ")[0]}!
        </h1>
        <p className="mt-1 opacity-90">
          Manage your education account and course payments
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Account Balance"
          value={`$${Number(currentUser.balance).toFixed(2)}`}
          subtitle="Available for course fees"
          icon={Wallet}
          variant="success"
        />
        <StatCard
          title="Active Courses"
          value={activeEnrollments.length}
          subtitle="Currently enrolled"
          icon={BookOpen}
          variant="accent"
        />
        {/* Outstanding Fees with Pay Now Action - Prominent */}
        <div
          className={`rounded-xl border-2 p-6 shadow-lg ${
            outstandingAmount > 0
              ? "border-warning bg-warning/10"
              : "border-border bg-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                  outstandingAmount > 0 ? "bg-warning/20" : "bg-muted"
                }`}
              >
                <AlertCircle
                  className={`h-7 w-7 ${
                    outstandingAmount > 0
                      ? "text-warning"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Outstanding Fees
                </p>
                <p className="text-3xl font-bold text-foreground">
                  ${outstandingAmount.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {pendingCharges.length} pending charge(s)
                </p>
              </div>
            </div>
            {outstandingAmount > 0 && (
              <Link to="/eservice/fees">
                <Button variant="accent" size="lg" className="shadow-md">
                  Pay Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Your Courses - Table Layout */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <BookOpen className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>Your Courses</CardTitle>
            </div>
            <Link to="/eservice/fees">
              <Button variant="ghost" size="sm">
                View all →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={courseData}
            columns={courseColumns}
            emptyMessage="No active courses"
          />
        </CardContent>
      </Card>
    </div>
  );
}

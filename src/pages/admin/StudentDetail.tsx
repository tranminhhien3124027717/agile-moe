import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  BookOpen,
  AlertCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import {
  useAccountHolder,
  useUpdateAccountHolder,
  useDeleteAccountHolder,
} from "@/hooks/useAccountHolders";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useCourses } from "@/hooks/useCourses";
import { useCourseCharges } from "@/hooks/useCourseCharges";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function StudentDetail() {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const { data: account, isLoading: loadingAccount } = useAccountHolder(
    accountId || ""
  );
  const { data: enrollments = [] } = useEnrollments();
  const { data: courses = [] } = useCourses();
  const { data: courseCharges = [] } = useCourseCharges();
  const updateAccountMutation = useUpdateAccountHolder();
  const deleteAccountMutation = useDeleteAccountHolder();

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDateOfBirth, setEditDateOfBirth] = useState("");
  const [editRegisteredAddress, setEditRegisteredAddress] = useState("");
  const [editMailingAddress, setEditMailingAddress] = useState("");
  const [editInSchool, setEditInSchool] = useState<
    "in_school" | "not_in_school"
  >("in_school");
  const [editEducationLevel, setEditEducationLevel] = useState<string>("");
  const [editStatus, setEditStatus] = useState<
    "active" | "inactive" | "closed" | "pending"
  >("active");

  const openEditDialog = () => {
    if (account) {
      setEditName(account.name);
      setEditEmail(account.email);
      setEditPhone(account.phone || "");
      setEditDateOfBirth(account.dateOfBirth);
      setEditRegisteredAddress(account.residentialAddress || "");
      setEditMailingAddress(account.mailingAddress || "");
      setEditInSchool(account.inSchool);
      setEditEducationLevel(account.educationLevel || "");
      setEditStatus(account.status);
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!account) return;

    await updateAccountMutation.mutateAsync({
      id: account.id,
      data: {
        name: editName,
        email: editEmail,
        phone: editPhone || null,
        dateOfBirth: editDateOfBirth,
        residentialAddress: editRegisteredAddress || null,
        mailingAddress: editMailingAddress || null,
        inSchool: editInSchool,
        educationLevel: editEducationLevel ? (editEducationLevel as any) : null,
        status: editStatus,
      },
    });

    setEditDialogOpen(false);
  };

  if (loadingAccount) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading student details...</div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Student not found</p>
        <Button variant="outline" onClick={() => navigate("/admin/accounts")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Accounts
        </Button>
      </div>
    );
  }

  // Calculate age
  const birthDate = new Date(account.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  console.log("StudentDetail Age Calculation:", {
    dateOfBirth: account.dateOfBirth,
    birthDate: birthDate.toString(),
    today: today.toString(),
    age,
  });

  // Get student's course charges (must be defined before enrolledCourses)
  const studentCharges = courseCharges.filter((c) => c.accountId === accountId);
  const outstandingCharges = studentCharges.filter(
    (c) => c.status === "pending" || c.status === "outstanding"
  );
  const clearCharges = studentCharges.filter((c) => c.status === "paid");
  const totalOutstanding = outstandingCharges.reduce(
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

    while (nextPayment <= today) {
      nextPayment.setMonth(nextPayment.getMonth() + months);
    }

    return nextPayment;
  };

  // Get student's enrollments with course details
  const studentEnrollments = enrollments.filter(
    (e) => e.accountId === accountId
  );
  const enrolledCourses = studentEnrollments
    .map((e) => {
      const course = courses.find((c) => c.id === e.courseId);
      if (!course) return null;

      // Get charges for this course
      const courseChargesForEnrollment = studentCharges.filter(
        (c) => c.courseId === course.id
      );
      const totalFee = courseChargesForEnrollment.reduce(
        (sum, c) => sum + Number(c.amount),
        0
      );
      const totalCollected = courseChargesForEnrollment
        .filter((c) => c.status === "paid")
        .reduce((sum, c) => sum + Number(c.amount), 0);

      // Calculate expected total fee based on course duration
      const courseStart = new Date(course.courseRunStart);
      const courseEnd = course.courseRunEnd
        ? new Date(course.courseRunEnd)
        : null;
      const today = new Date();

      let expectedTotalFee = totalFee; // Default to charges created so far
      if (courseEnd) {
        const monthsDuration = Math.ceil(
          (courseEnd.getTime() - courseStart.getTime()) /
            (1000 * 60 * 60 * 24 * 30)
        );
        if (course.billingCycle === "monthly") {
          expectedTotalFee = course.fee * monthsDuration;
        } else if (course.billingCycle === "quarterly") {
          const quarters = Math.ceil(monthsDuration / 3);
          expectedTotalFee = course.fee * quarters;
        }
      }

      // Determine payment status based on charge statuses and collected amount
      // - scheduled: All current charges paid, course ongoing (waiting for future charges)
      // - outstanding: Has unpaid charges (pending or outstanding)
      // - fully_paid: All charges paid AND totalCollected >= expectedTotalFee (course completed)

      const hasUnpaid = courseChargesForEnrollment.some(
        (c) => c.status === "outstanding" || c.status === "pending"
      );
      const allPaid =
        courseChargesForEnrollment.length > 0 &&
        courseChargesForEnrollment.every((c) => c.status === "paid");

      // Check if course is fully paid based on expected total fee
      const isFullyPaid =
        allPaid && totalCollected >= expectedTotalFee && expectedTotalFee > 0;

      let paymentStatus: "scheduled" | "outstanding" | "fully_paid" =
        "scheduled";

      if (hasUnpaid) {
        // Has unpaid charges (pending or outstanding) → Outstanding
        paymentStatus = "outstanding";
      } else if (isFullyPaid) {
        // All paid AND collected >= expectedTotalFee → Fully Paid (no more charges expected)
        paymentStatus = "fully_paid";
      } else if (allPaid) {
        // All current charges paid, but totalCollected < expectedTotalFee → Scheduled (waiting for future charges)
        paymentStatus = "scheduled";
      }
      // If no charges yet, default to "scheduled" (awaiting first charge)

      const nextPaymentDate = calculateNextPaymentDate(
        e.enrollmentDate,
        course.billingCycle
      );

      return {
        id: e.id,
        courseName: course.name,
        provider: course.provider,
        fee: Number(course.fee),
        billingCycle: course.billingCycle,
        enrollmentDate: e.enrollmentDate,
        nextPaymentDate,
        paymentStatus,
        totalFee,
        totalCollected,
      };
    })
    .filter(Boolean) as {
    id: string;
    courseName: string;
    provider: string;
    fee: number;
    billingCycle: string;
    enrollmentDate: string;
    nextPaymentDate: Date;
    paymentStatus: "scheduled" | "outstanding" | "fully_paid";
    totalFee: number;
    totalCollected: number;
  }[];

  // Education level labels
  const educationLevelLabels: Record<string, string> = {
    primary: "Primary",
    secondary: "Secondary",
    post_secondary: "Post-Secondary",
    tertiary: "Tertiary",
    postgraduate: "Postgraduate",
  };

  const handleCloseAccount = async () => {
    await deleteAccountMutation.mutateAsync(account.id);
    navigate("/admin/accounts");
  };

  const courseColumns = [
    {
      key: "courseName",
      header: "Course Name",
      render: (item: (typeof enrolledCourses)[0]) => (
        <div>
          <p className="font-medium text-foreground">{item.courseName}</p>
          <p className="text-xs text-muted-foreground">{item.provider}</p>
        </div>
      ),
    },
    {
      key: "billingCycle",
      header: "Billing Cycle",
      render: (item: (typeof enrolledCourses)[0]) => {
        const cycleLabels: Record<string, string> = {
          monthly: "Monthly",
          quarterly: "Quarterly",
          biannually: "Bi-annually",
          yearly: "Yearly",
        };
        return (
          <span className="text-muted-foreground">
            {cycleLabels[item.billingCycle] || item.billingCycle}
          </span>
        );
      },
    },
    {
      key: "totalFee",
      header: "Total Fee",
      render: (item: (typeof enrolledCourses)[0]) => (
        <span className="font-semibold text-foreground">
          ${item.totalFee.toFixed(2)}
        </span>
      ),
    },
    {
      key: "totalCollected",
      header: "Collected",
      render: (item: (typeof enrolledCourses)[0]) => (
        <span className="font-semibold text-success">
          ${item.totalCollected.toFixed(2)}
        </span>
      ),
    },
    {
      key: "enrollmentDate",
      header: "Enrolled Date",
      render: (item: (typeof enrolledCourses)[0]) => (
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
      render: (item: (typeof enrolledCourses)[0]) => {
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
              {item.nextPaymentDate
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                .replace(/\//g, "/")}
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
      render: (item: (typeof enrolledCourses)[0]) => (
        <StatusBadge status={item.paymentStatus} />
      ),
    },
  ];

  const chargeColumns = [
    {
      key: "course_name",
      header: "Course",
      render: (item: (typeof studentCharges)[0]) => (
        <span className="font-medium text-foreground">{item.courseName}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (item: (typeof studentCharges)[0]) => (
        <span className="font-semibold text-foreground">
          ${Number(item.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (item: (typeof studentCharges)[0]) => (
        <span className="text-muted-foreground">
          {new Date(item.dueDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  const paymentHistoryColumns = [
    {
      key: "course_name",
      header: "Course",
      render: (item: (typeof studentCharges)[0]) => (
        <span className="font-medium text-foreground">{item.courseName}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (item: (typeof studentCharges)[0]) => (
        <span className="font-semibold text-foreground">
          ${Number(item.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (item: (typeof studentCharges)[0]) => (
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
      key: "payment_method",
      header: "Payment Method",
      render: (item: (typeof studentCharges)[0]) => {
        const methodLabels: Record<string, string> = {
          account_balance: "Account Balance",
          credit_card: "Credit/Debit Card",
          bank_transfer: "Bank Transfer",
        };
        const method = item.paymentMethod || "account_balance";
        return (
          <span className="text-muted-foreground">
            {methodLabels[method] || "Account Balance"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/accounts")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {account.name}
            </h1>
            <p className="text-muted-foreground">{account.nric}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openEditDialog}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>

          {account.status !== "closed" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Close Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Close Student Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the account for {account.name}.
                    This action cannot be undone. The student will no longer be
                    able to access the e-service portal.
                    {totalOutstanding > 0 && (
                      <span className="block mt-2 text-warning font-medium">
                        Warning: This student has ${totalOutstanding.toFixed(2)}{" "}
                        in outstanding fees.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCloseAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Close Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editNric">NRIC *</Label>
              <Input
                id="editNric"
                value={account.nric}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editName">Full Name *</Label>
              <Input
                id="editName"
                value={editName}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editDateOfBirth">Date of Birth *</Label>
              <Input
                id="editDateOfBirth"
                type="date"
                value={editDateOfBirth}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editEmail">Email *</Label>
              <Input
                id="editEmail"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input
                id="editPhone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editRegisteredAddress">Registered Address</Label>
              <Input
                id="editRegisteredAddress"
                value={editRegisteredAddress}
                onChange={(e) => setEditRegisteredAddress(e.target.value)}
                placeholder="Enter registered address"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editMailingAddress">Mailing Address</Label>
              <Input
                id="editMailingAddress"
                value={editMailingAddress}
                onChange={(e) => setEditMailingAddress(e.target.value)}
                placeholder="Enter mailing address"
              />
            </div>

            <div className="grid gap-2">
              <Label>Education Level</Label>
              <Select
                value={editEducationLevel}
                onValueChange={setEditEducationLevel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="post_secondary">Post-Secondary</SelectItem>
                  <SelectItem value="tertiary">Tertiary</SelectItem>
                  <SelectItem value="postgraduate">Postgraduate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={
                  !editName ||
                  !editEmail ||
                  !editDateOfBirth ||
                  updateAccountMutation.isPending
                }
              >
                {updateAccountMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <CreditCard className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  ${Number(account.balance).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Enrolled Courses
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {enrolledCourses.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  totalOutstanding > 0 ? "bg-warning/10" : "bg-success/10"
                }`}
              >
                <AlertCircle
                  className={`h-6 w-6 ${
                    totalOutstanding > 0 ? "text-warning" : "text-success"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Outstanding Fees
                </p>
                <p
                  className={`text-2xl font-bold ${
                    totalOutstanding > 0 ? "text-warning" : "text-success"
                  }`}
                >
                  ${totalOutstanding.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <CreditCard className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-success">
                  $
                  {clearCharges
                    .reduce((sum, c) => sum + Number(c.amount), 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Full Name
              </p>
              <p className="font-medium text-foreground">{account.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                NRIC
              </p>
              <p className="font-medium text-foreground">{account.nric}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Date of Birth
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-foreground">
                  {new Date(account.dateOfBirth).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
                  ({age} years old)
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Email
              </p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-foreground">{account.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Phone
              </p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-foreground">
                  {account.phone || "—"}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Education Level
              </p>
              <p className="font-medium text-foreground">
                {account.educationLevel
                  ? educationLevelLabels[account.educationLevel]
                  : "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Schooling Status
              </p>
              <StatusBadge status={account.inSchool} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Registered Address
              </p>
              <p className="font-medium text-foreground">
                {account.residentialAddress || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Mailing Address
              </p>
              <p className="font-medium text-foreground">
                {account.mailingAddress || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Account Created
              </p>
              <p className="font-medium text-foreground">
                {new Date(account.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            Enrolled Courses ({enrolledCourses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={enrolledCourses}
            columns={courseColumns}
            emptyMessage="No courses enrolled"
          />
        </CardContent>
      </Card>

      {/* Outstanding Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle
              className={`h-5 w-5 ${
                outstandingCharges.length > 0 ? "text-warning" : "text-success"
              }`}
            />
            Outstanding Fees ({outstandingCharges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={outstandingCharges}
            columns={chargeColumns}
            emptyMessage="No outstanding fees"
          />
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-success" />
            Payment History ({clearCharges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={clearCharges}
            columns={paymentHistoryColumns}
            emptyMessage="No payment history"
          />
        </CardContent>
      </Card>
    </div>
  );
}

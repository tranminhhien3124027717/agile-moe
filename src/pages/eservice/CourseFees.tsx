import { useState, useEffect } from "react";
import { CreditCard, Wallet, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useUpdateAccountHolder } from "@/hooks/useAccountHolders";
import {
  useCourseCharges,
  CourseCharge,
  useUpdateCourseCharge,
} from "@/hooks/useCourseCharges";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useCurrentUser } from "@/contexts/CurrentUserContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CourseFees() {
  const { currentUser, isLoading: loadingUser } = useCurrentUser();

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPayAllDialogOpen, setIsPayAllDialogOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<CourseCharge | null>(
    null
  );

  // Payment options
  const [useAccountBalance, setUseAccountBalance] = useState(true);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [externalMethod, setExternalMethod] = useState("");
  const [externalAmount, setExternalAmount] = useState("");

  // Pay All options
  const [payAllUseBalance, setPayAllUseBalance] = useState(true);
  const [payAllBalanceAmount, setPayAllBalanceAmount] = useState("");
  const [payAllExternalMethod, setPayAllExternalMethod] = useState("");

  // Fetch data from database
  const { data: courseCharges = [] } = useCourseCharges();

  // Mutations for actual payment processing
  const updateAccountMutation = useUpdateAccountHolder();
  const updateChargeMutation = useUpdateCourseCharge();
  const createTransactionMutation = useCreateTransaction();

  const [isProcessing, setIsProcessing] = useState(false);

  const userCharges = courseCharges.filter(
    (c) => c.accountId === currentUser?.id
  );
  const pendingCharges = userCharges.filter(
    (c) => c.status === "pending" || c.status === "outstanding"
  );
  const paidCharges = userCharges.filter((c) => c.status === "paid");

  const totalOutstanding = pendingCharges.reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );

  // Calculate remaining amount to pay externally
  const balanceAmountNum = parseFloat(balanceAmount) || 0;
  const chargeAmount = selectedCharge ? Number(selectedCharge.amount) : 0;
  const remainingAmount = Math.max(0, chargeAmount - balanceAmountNum);
  const maxBalanceUsable = currentUser
    ? Math.min(Number(currentUser.balance), chargeAmount)
    : 0;

  // Reset form when dialog opens
  useEffect(() => {
    if (selectedCharge && isPaymentDialogOpen && currentUser) {
      const defaultBalanceAmount = Math.min(
        Number(currentUser.balance),
        Number(selectedCharge.amount)
      );
      setBalanceAmount(defaultBalanceAmount.toFixed(2));
      setUseAccountBalance(defaultBalanceAmount > 0);
      setExternalMethod("");
      setExternalAmount(
        Math.max(
          0,
          Number(selectedCharge.amount) - defaultBalanceAmount
        ).toFixed(2)
      );
    }
  }, [selectedCharge, isPaymentDialogOpen, currentUser]);

  // No longer auto-update external amount - user controls it
  const totalPaymentAmount =
    (useAccountBalance ? balanceAmountNum : 0) +
    (parseFloat(externalAmount) || 0);

  const handlePayment = (charge: CourseCharge) => {
    setSelectedCharge(charge);
    setIsPaymentDialogOpen(true);
  };

  const handlePayAll = () => {
    if (!currentUser) return;
    const defaultBalanceAmount = Math.min(
      Number(currentUser.balance),
      totalOutstanding
    );
    setPayAllBalanceAmount(defaultBalanceAmount.toFixed(2));
    setPayAllUseBalance(true);
    setPayAllExternalMethod("");
    setIsPayAllDialogOpen(true);
  };

  const payAllBalanceAmountNum = parseFloat(payAllBalanceAmount) || 0;
  const payAllMaxBalanceUsable = currentUser
    ? Math.min(Number(currentUser.balance), totalOutstanding)
    : 0;
  const payAllRemainingAmount = Math.max(
    0,
    totalOutstanding - payAllBalanceAmountNum
  );

  const processPayAll = async () => {
    if (!currentUser || pendingCharges.length === 0 || isProcessing) return;

    const balancePaid = payAllUseBalance ? payAllBalanceAmountNum : 0;
    const externalPaid = payAllRemainingAmount;
    const totalPaid = balancePaid + externalPaid;

    if (totalPaid < totalOutstanding) {
      toast.error("Payment amount is less than the total outstanding amount");
      return;
    }

    if (balancePaid > Number(currentUser.balance)) {
      toast.error("Insufficient account balance");
      return;
    }

    if (externalPaid > 0 && !payAllExternalMethod) {
      toast.error("Please select an external payment method");
      return;
    }

    setIsProcessing(true);

    try {
      const methodLabels: Record<string, string> = {
        credit_card: "Credit Card",
        paynow: "PayNow",
        bank_transfer: "Bank Transfer",
        account_balance: "Account Balance",
      };

      // Determine payment method for record
      let paymentMethod = "account_balance";
      if (balancePaid > 0 && externalPaid > 0) {
        paymentMethod = `account_balance+${payAllExternalMethod}`;
      } else if (externalPaid > 0) {
        paymentMethod = payAllExternalMethod;
      }

      // Update all pending charges to 'paid'
      for (const charge of pendingCharges) {
        await updateChargeMutation.mutateAsync({
          id: charge.id,
          status: "paid",
          paidDate: new Date().toISOString().split("T")[0],
          paymentMethod: paymentMethod,
        });
      }

      // Deduct from account balance if using balance
      if (balancePaid > 0) {
        const newBalance = Number(currentUser.balance) - balancePaid;
        await updateAccountMutation.mutateAsync({
          id: currentUser.id,
          data: { balance: newBalance },
        });

        // Create a transaction record for balance payment
        await createTransactionMutation.mutateAsync({
          accountId: currentUser.id,
          type: "course_fee",
          amount: -balancePaid,
          description: `Course fee payment: ${pendingCharges.length} charge(s)`,
          reference: `CF-${Date.now()}`,
          status: "completed",
        });
      }

      let description = `Paid ${pendingCharges.length} course fee(s). `;
      if (balancePaid > 0 && externalPaid > 0) {
        description += `$${balancePaid.toFixed(
          2
        )} from Account Balance + $${externalPaid.toFixed(2)} via ${
          methodLabels[payAllExternalMethod]
        }`;
      } else if (balancePaid > 0) {
        description += `$${balancePaid.toFixed(2)} paid from Account Balance`;
      } else {
        description += `$${externalPaid.toFixed(2)} paid via ${
          methodLabels[payAllExternalMethod]
        }`;
      }

      toast.success("All fees paid successfully!", { description });
      setIsPayAllDialogOpen(false);
    } catch (error) {
      toast.error("Payment failed", { description: "Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async () => {
    if (!selectedCharge || !currentUser || isProcessing) return;

    const balancePaid = useAccountBalance ? balanceAmountNum : 0;
    const externalPaid = parseFloat(externalAmount) || 0;
    const totalPaid = balancePaid + externalPaid;
    const chargeTotal = Number(selectedCharge.amount);

    if (totalPaid < chargeTotal) {
      toast.error("Full payment required", {
        description: `Please pay the full amount of $${chargeTotal.toFixed(2)}`,
      });
      return;
    }

    if (balancePaid > Number(currentUser.balance)) {
      toast.error("Insufficient account balance");
      return;
    }

    if (externalPaid > 0 && !externalMethod) {
      toast.error("Please select an external payment method");
      return;
    }

    setIsProcessing(true);

    try {
      const methodLabels: Record<string, string> = {
        credit_card: "Credit Card",
        paynow: "PayNow",
        bank_transfer: "Bank Transfer",
        account_balance: "Account Balance",
      };

      // Determine payment method for record
      let paymentMethod = "account_balance";
      if (balancePaid > 0 && externalPaid > 0) {
        paymentMethod = `account_balance+${externalMethod}`;
      } else if (externalPaid > 0) {
        paymentMethod = externalMethod;
      }

      // 1. Update the course charge to clear
      await updateChargeMutation.mutateAsync({
        id: selectedCharge.id,
        status: "paid",
        paidDate: new Date().toISOString().split("T")[0],
        paymentMethod: paymentMethod,
      });

      // 2. If external payment, add it to balance first (simulating successful external payment)
      let currentBalance = Number(currentUser.balance);
      if (externalPaid > 0) {
        currentBalance += externalPaid;
        // Create a transaction record for external payment received
        await createTransactionMutation.mutateAsync({
          accountId: currentUser.id,
          type: "payment",
          amount: externalPaid,
          description: `External payment received via ${methodLabels[externalMethod]}`,
          reference: `EP-${Date.now()}`,
          status: "completed",
        });
      }

      // 3. Deduct the full charge amount from balance
      const newBalance = currentBalance - chargeTotal;
      await updateAccountMutation.mutateAsync({
        id: currentUser.id,
        data: { balance: newBalance },
      });

      // 4. Create a transaction record for course fee payment
      await createTransactionMutation.mutateAsync({
        accountId: currentUser.id,
        type: "course_fee",
        amount: -chargeTotal,
        description: `Course fee payment: ${selectedCharge.courseName}`,
        reference: `CF-${Date.now()}`,
        status: "completed",
      });

      let description = "";
      if (balancePaid > 0 && externalPaid > 0) {
        description = `$${balancePaid.toFixed(
          2
        )} from Account Balance + $${externalPaid.toFixed(2)} via ${
          methodLabels[externalMethod]
        }`;
      } else if (balancePaid > 0) {
        description = `$${balancePaid.toFixed(2)} paid from Account Balance`;
      } else {
        description = `$${externalPaid.toFixed(2)} paid via ${
          methodLabels[externalMethod]
        }`;
      }

      toast.success("Payment successful!", { description });
      setIsPaymentDialogOpen(false);
      setSelectedCharge(null);
    } catch (error) {
      toast.error("Payment failed", { description: "Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingUser || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const billingCycleLabels: Record<string, string> = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    biannually: "Bi-annually",
    yearly: "Yearly",
  };

  const pendingColumns = [
    {
      key: "courseName",
      header: "Course",
      render: (item: CourseCharge) => (
        <div>
          <p className="font-medium text-foreground">{item.courseName}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (item: CourseCharge) => (
        <span className="font-semibold text-foreground">
          ${Number(item.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (item: CourseCharge) => {
        const dueDate = new Date(item.dueDate);
        const today = new Date();
        const daysUntil = Math.ceil(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        const isOverdue = daysUntil < 0;
        const isUpcoming = daysUntil >= 0 && daysUntil <= 7;

        return (
          <div>
            <p
              className={`font-medium ${
                isOverdue
                  ? "text-destructive"
                  : isUpcoming
                  ? "text-warning"
                  : "text-foreground"
              }`}
            >
              {dueDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {isOverdue
                ? `${Math.abs(daysUntil)} days overdue`
                : daysUntil === 0
                ? "Due today"
                : `In ${daysUntil} days`}
            </p>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (item: CourseCharge) => <StatusBadge status={item.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (item: CourseCharge) => (
        <Button variant="accent" size="sm" onClick={() => handlePayment(item)}>
          Pay Now
        </Button>
      ),
    },
  ];

  const paidColumns = [
    {
      key: "courseName",
      header: "Course",
      render: (item: CourseCharge) => (
        <div>
          <p className="font-medium text-foreground">{item.courseName}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (item: CourseCharge) => (
        <span className="font-semibold text-foreground">
          ${Number(item.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "paidDate",
      header: "Paid Date",
      render: (item: CourseCharge) => (
        <span className="text-muted-foreground">
          {item.paidDate
            ? new Date(item.paidDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      header: "Method",
      render: (item: CourseCharge) => (
        <span className="text-xs text-muted-foreground capitalize">
          {item.paymentMethod?.replace("_", " ") || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: CourseCharge) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Course Fees</h1>
        <p className="text-muted-foreground mt-1">
          View and pay your course fee charges
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalOutstanding.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Wallet className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Balance</p>
              <p className="text-2xl font-bold text-foreground">
                ${Number(currentUser.balance).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month Paid</p>
              <p className="text-2xl font-bold text-foreground">
                $
                {paidCharges
                  .reduce((sum, c) => sum + Number(c.amount), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pending ({pendingCharges.length})
          </TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidCharges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingCharges.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button variant="accent" onClick={handlePayAll}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Pay All Outstanding (${totalOutstanding.toFixed(2)})
                </Button>
              </div>
              <DataTable data={pendingCharges} columns={pendingColumns} />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
              <h3 className="font-semibold text-foreground">All Paid Up!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You have no outstanding course fees
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="paid">
          <DataTable
            data={paidCharges}
            columns={paidColumns}
            emptyMessage="No payment history"
          />
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pay Course Fee</DialogTitle>
            <DialogDescription>
              Choose how you'd like to pay. You can split payment between your
              account balance and an external method.
            </DialogDescription>
          </DialogHeader>

          {selectedCharge && (
            <div className="space-y-6 py-4">
              {/* Charge Details */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Course</span>
                  <span className="font-medium">
                    {selectedCharge.courseName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Amount to Pay
                  </span>
                  <span className="font-bold text-lg">
                    ${chargeAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Due Date
                  </span>
                  <span>
                    {new Date(selectedCharge.dueDate).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>

              {/* Account Balance Payment */}
              <div
                className={`rounded-lg border p-4 transition-all ${
                  useAccountBalance
                    ? "border-accent bg-accent/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Checkbox
                    id="use-balance"
                    checked={useAccountBalance}
                    onCheckedChange={(checked) => {
                      setUseAccountBalance(checked === true);
                      if (!checked) {
                        setBalanceAmount("0");
                      } else {
                        setBalanceAmount(
                          Math.min(
                            Number(currentUser.balance),
                            chargeAmount
                          ).toFixed(2)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor="use-balance"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Wallet className="h-5 w-5 text-accent" />
                    <span className="font-medium">Use Account Balance</span>
                  </Label>
                </div>
                {useAccountBalance && (
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Amount:
                      </span>
                      <div className="relative flex-1 max-w-[150px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          value={balanceAmount}
                          onChange={(e) => {
                            const val = Math.min(
                              parseFloat(e.target.value) || 0,
                              maxBalanceUsable
                            );
                            setBalanceAmount(val.toFixed(2));
                          }}
                          className="pl-7"
                          min="0"
                          max={maxBalanceUsable}
                          step="0.01"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Available balance: $
                      {Number(currentUser.balance).toFixed(2)} (Max usable: $
                      {maxBalanceUsable.toFixed(2)})
                    </p>
                  </div>
                )}
              </div>

              {/* External Payment Method */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      External Payment (Optional)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <div className="relative flex-1 max-w-[150px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      value={externalAmount}
                      onChange={(e) => {
                        const val = Math.max(
                          0,
                          parseFloat(e.target.value) || 0
                        );
                        setExternalAmount(val.toFixed(2));
                      }}
                      className="pl-7"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {parseFloat(externalAmount) > 0 && (
                  <Select
                    value={externalMethod}
                    onValueChange={setExternalMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">
                        Credit/Debit Card
                      </SelectItem>
                      <SelectItem value="paynow">PayNow</SelectItem>
                      <SelectItem value="bank_transfer">
                        Bank Transfer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Payment Summary */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Payment Summary
                </p>
                {useAccountBalance && balanceAmountNum > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Account Balance
                    </span>
                    <span className="text-foreground">
                      ${balanceAmountNum.toFixed(2)}
                    </span>
                  </div>
                )}
                {parseFloat(externalAmount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      External Payment
                    </span>
                    <span className="text-foreground">
                      ${parseFloat(externalAmount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-primary/20">
                  <span className="font-medium">Total Payment</span>
                  <span className="font-bold">
                    ${totalPaymentAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={processPayment}
              disabled={
                (parseFloat(externalAmount) > 0 && !externalMethod) ||
                isProcessing ||
                totalPaymentAmount <= 0
              }
            >
              {isProcessing
                ? "Processing..."
                : `Pay $${totalPaymentAmount.toFixed(2)}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pay All Dialog */}
      <Dialog open={isPayAllDialogOpen} onOpenChange={setIsPayAllDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pay All Outstanding Fees</DialogTitle>
            <DialogDescription>
              Pay all {pendingCharges.length} pending course fee(s) at once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Charges Summary */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Charges to Pay
              </p>
              {pendingCharges.map((charge) => (
                <div key={charge.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {charge.courseName}
                  </span>
                  <span className="font-medium">
                    ${Number(charge.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-border mt-2">
                <span className="font-medium">Total Outstanding</span>
                <span className="font-bold text-lg">
                  ${totalOutstanding.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Account Balance Payment */}
            <div
              className={`rounded-lg border p-4 transition-all ${
                payAllUseBalance ? "border-accent bg-accent/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Checkbox
                  id="pay-all-use-balance"
                  checked={payAllUseBalance}
                  onCheckedChange={(checked) => {
                    setPayAllUseBalance(checked === true);
                    if (!checked) {
                      setPayAllBalanceAmount("0");
                    } else {
                      setPayAllBalanceAmount(
                        Math.min(
                          Number(currentUser?.balance || 0),
                          totalOutstanding
                        ).toFixed(2)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor="pay-all-use-balance"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Wallet className="h-5 w-5 text-accent" />
                  <span className="font-medium">Use Account Balance</span>
                </Label>
              </div>
              {payAllUseBalance && (
                <div className="ml-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Amount:
                    </span>
                    <div className="relative flex-1 max-w-[150px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        value={payAllBalanceAmount}
                        onChange={(e) => {
                          const val = Math.min(
                            parseFloat(e.target.value) || 0,
                            payAllMaxBalanceUsable
                          );
                          setPayAllBalanceAmount(val.toFixed(2));
                        }}
                        className="pl-7"
                        min="0"
                        max={payAllMaxBalanceUsable}
                        step="0.01"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available balance: $
                    {Number(currentUser?.balance || 0).toFixed(2)} (Max usable:
                    ${payAllMaxBalanceUsable.toFixed(2)})
                  </p>
                </div>
              )}
            </div>

            {/* External Payment Method */}
            {payAllRemainingAmount > 0 && (
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-medium">External Payment</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    ${payAllRemainingAmount.toFixed(2)}
                  </span>
                </div>

                <Select
                  value={payAllExternalMethod}
                  onValueChange={setPayAllExternalMethod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">
                      Credit/Debit Card
                    </SelectItem>
                    <SelectItem value="paynow">PayNow</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Payment Summary */}
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                Payment Summary
              </p>
              {payAllUseBalance && payAllBalanceAmountNum > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account Balance</span>
                  <span className="text-foreground">
                    ${payAllBalanceAmountNum.toFixed(2)}
                  </span>
                </div>
              )}
              {payAllRemainingAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    External Payment
                  </span>
                  <span className="text-foreground">
                    ${payAllRemainingAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-primary/20">
                <span className="font-medium">Total</span>
                <span className="font-bold">
                  ${totalOutstanding.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPayAllDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={processPayAll}
              disabled={
                (payAllRemainingAmount > 0 && !payAllExternalMethod) ||
                isProcessing
              }
            >
              {isProcessing
                ? "Processing..."
                : `Pay All $${totalOutstanding.toFixed(2)}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

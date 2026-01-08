import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Plus,
  Search,
  Zap,
  CalendarClock,
  Calendar,
  Users,
  User,
  Filter,
  X,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatCard } from "@/components/shared/StatCard";
import {
  useTopUpRules,
  useCreateTopUpRule,
  useDeleteTopUpRule,
  useUpdateTopUpRule,
} from "@/hooks/useTopUpRules";
import {
  useTopUpSchedules,
  useCreateTopUpSchedule,
  useDeleteTopUpSchedule,
} from "@/hooks/useTopUpSchedules";
import {
  useAccountHolders,
  useUpdateAccountHolder,
} from "@/hooks/useAccountHolders";
import { useCreateTransaction } from "@/hooks/useTransactions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TopUpManagement() {
  const navigate = useNavigate();
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isIndividualDialogOpen, setIsIndividualDialogOpen] = useState(false);
  const [isBatchScheduleDialogOpen, setIsBatchScheduleDialogOpen] =
    useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleNow, setScheduleNow] = useState(false);
  const [accountSearch, setAccountSearch] = useState("");

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Delete schedule confirmation state
  const [deleteScheduleConfirmOpen, setDeleteScheduleConfirmOpen] =
    useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Execute confirmation state
  const [executeConfirmOpen, setExecuteConfirmOpen] = useState(false);
  const [ruleToExecute, setRuleToExecute] = useState<{
    id: string;
    name: string;
    amount: number;
    eligibleCount: number;
  } | null>(null);

  // Edit rule state
  const [editingRule, setEditingRule] = useState<(typeof topUpRules)[0] | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Rule creation form state
  const [ruleName, setRuleName] = useState("");
  const [ruleAmount, setRuleAmount] = useState("");
  const [ruleMinAge, setRuleMinAge] = useState("");
  const [ruleMaxAge, setRuleMaxAge] = useState("");
  const [ruleMinBalance, setRuleMinBalance] = useState("");
  const [ruleMaxBalance, setRuleMaxBalance] = useState("");
  const [ruleInSchool, setRuleInSchool] = useState<
    "in_school" | "not_in_school" | "any"
  >("any");
  const [ruleEducationLevel, setRuleEducationLevel] = useState<string>("any");
  const [ruleScheduleNow, setRuleScheduleNow] = useState(false);
  const [ruleScheduleDate, setRuleScheduleDate] = useState("");
  const [ruleScheduleTime, setRuleScheduleTime] = useState("09:00");

  // Top-up history filters
  const [statusFilter, setStatusFilter] = useState<
    "all" | "scheduled" | "completed"
  >("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "batch" | "individual">(
    "all"
  );
  const [amountFilter, setAmountFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<
    "created_desc" | "scheduled_earliest" | "scheduled_latest"
  >("created_desc");

  // Fetch data from database
  const { data: topUpRules = [], isLoading: loadingRules } = useTopUpRules();
  const { data: topUpSchedules = [], isLoading: loadingSchedules } =
    useTopUpSchedules();
  const { data: accountHolders = [] } = useAccountHolders();
  const createScheduleMutation = useCreateTopUpSchedule();
  const deleteScheduleMutation = useDeleteTopUpSchedule();
  const createRuleMutation = useCreateTopUpRule();
  const deleteRuleMutation = useDeleteTopUpRule();
  const updateRuleMutation = useUpdateTopUpRule();
  const updateAccountMutation = useUpdateAccountHolder();
  const createTransactionMutation = useCreateTransaction();

  const handleNavigateToStudent = (accountId: string) => {
    navigate(`/admin/accounts/${accountId}`);
  };

  const filteredAccountHolders = useMemo(() => {
    if (!accountSearch.trim())
      return accountHolders.filter((a) => a.status === "active");
    const searchLower = accountSearch.toLowerCase().trim();
    return accountHolders.filter(
      (a) =>
        a.status === "active" &&
        (a.name.toLowerCase().includes(searchLower) ||
          a.nric.toLowerCase().includes(searchLower))
    );
  }, [accountSearch, accountHolders]);

  // Calculate eligible accounts based on rule criteria
  const calculateEligibleAccounts = (
    minAge: number | null,
    maxAge: number | null,
    minBalance: number | null,
    maxBalance: number | null,
    inSchool: "in_school" | "not_in_school" | null,
    educationLevel: string | null
  ) => {
    return accountHolders.filter((account) => {
      if (account.status !== "active") return false;

      // Calculate age
      const birthDate = new Date(account.dateOfBirth);
      const today = new Date();
      const age = Math.floor(
        (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );

      if (minAge !== null && age < minAge) return false;
      if (maxAge !== null && age > maxAge) return false;
      if (minBalance !== null && Number(account.balance) < minBalance)
        return false;
      if (maxBalance !== null && Number(account.balance) > maxBalance)
        return false;
      if (inSchool !== null && account.inSchool !== inSchool) return false;
      if (educationLevel !== null && account.educationLevel !== educationLevel)
        return false;

      return true;
    });
  };

  const handleCreateRule = async () => {
    if (!ruleName.trim()) {
      toast.error("Please enter a rule name");
      return;
    }
    if (!ruleAmount || parseFloat(ruleAmount) <= 0) {
      toast.error("Please enter a valid top-up amount");
      return;
    }

    const amount = parseFloat(ruleAmount);
    const minAge = ruleMinAge ? parseInt(ruleMinAge) : null;
    const maxAge = ruleMaxAge ? parseInt(ruleMaxAge) : null;
    const minBalance = ruleMinBalance ? parseFloat(ruleMinBalance) : null;
    const maxBalance = ruleMaxBalance ? parseFloat(ruleMaxBalance) : null;
    const inSchool = ruleInSchool === "any" ? null : ruleInSchool;
    const educationLevel =
      ruleEducationLevel === "any" ? null : ruleEducationLevel;

    try {
      // Create the rule only (no schedule)
      await createRuleMutation.mutateAsync({
        name: ruleName.trim(),
        amount: amount,
        minAge: minAge,
        maxAge: maxAge,
        minBalance: minBalance,
        maxBalance: maxBalance,
        inSchool: inSchool,
        educationLevel: educationLevel as any,
        continuingLearning: null,
        status: "active",
      });

      toast.success("Top-up rule created successfully");

      // Reset form
      setRuleName("");
      setRuleAmount("");
      setRuleMinAge("");
      setRuleMaxAge("");
      setRuleMinBalance("");
      setRuleMaxBalance("");
      setRuleInSchool("any");
      setRuleEducationLevel("any");
      setRuleScheduleNow(true);
      setRuleScheduleDate("");
      setRuleScheduleTime("09:00");
      setIsRuleDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };
  const handleScheduleBatchTopUp = async () => {
    if (selectedRules.length === 0) {
      toast.error("Please select at least one top-up rule");
      return;
    }
    if (!scheduleNow && !scheduleDate) {
      toast.error("Please select a schedule date");
      return;
    }

    const rules = topUpRules.filter((r) => selectedRules.includes(r.id));
    if (rules.length === 0) return;

    // Calculate total amount and combined eligible accounts
    const totalAmount = rules.reduce((sum, r) => sum + Number(r.amount), 0);
    const ruleNames = rules.map((r) => r.name).join(", ");

    // Calculate unique eligible accounts across all selected rules
    const eligibleAccountIds = new Set<string>();
    rules.forEach((rule) => {
      const eligible = calculateEligibleAccounts(
        rule.minAge,
        rule.maxAge,
        rule.minBalance,
        rule.maxBalance,
        rule.inSchool,
        rule.educationLevel
      );
      eligible.forEach((acc) => eligibleAccountIds.add(acc.id));
    });

    try {
      // Create a schedule for each selected rule
      await Promise.all(
        rules.map((rule) => {
          const eligibleAccounts = calculateEligibleAccounts(
            rule.minAge,
            rule.maxAge,
            rule.minBalance,
            rule.maxBalance,
            rule.inSchool,
            rule.educationLevel
          );

          return createScheduleMutation.mutateAsync({
            type: "batch",
            scheduledDate: scheduleNow
              ? new Date().toISOString().split("T")[0]
              : scheduleDate,
            scheduledTime: scheduleNow
              ? new Date().toTimeString().slice(0, 5)
              : scheduleTime,
            amount: rule.amount,
            ruleId: rule.id,
            ruleName: rule.name,
            eligibleCount: eligibleAccounts.length,
            status: scheduleNow ? "processing" : "scheduled",
            executedDate: null,
            processedCount: null,
            accountId: null,
            accountName: null,
            remarks:
              rules.length > 1
                ? `Part of batch with ${rules.length} rules`
                : null,
          });
        })
      );

      toast.success(`${rules.length} batch top-up(s) scheduled`, {
        description: `Total: $${totalAmount.toFixed(2)} for ${
          eligibleAccountIds.size
        } unique accounts`,
      });

      setIsBatchScheduleDialogOpen(false);
      setSelectedRules([]);
      setScheduleDate("");
      setScheduleTime("09:00");
      setScheduleNow(true);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleIndividualTopUp = async () => {
    if (!selectedAccount || !topUpAmount) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!scheduleNow && !scheduleDate) {
      toast.error("Please select a schedule date");
      return;
    }
    const account = accountHolders.find((a) => a.id === selectedAccount);
    if (!account) return;

    const amount = parseFloat(topUpAmount);
    const isImmediate = scheduleNow;

    try {
      // Create the schedule record
      await createScheduleMutation.mutateAsync({
        type: "individual",
        scheduledDate: isImmediate
          ? new Date().toISOString().split("T")[0]
          : scheduleDate,
        scheduledTime: isImmediate
          ? new Date().toTimeString().slice(0, 5)
          : "09:00",
        amount: amount,
        accountId: account.id,
        accountName: account.name,
        status: isImmediate ? "completed" : "scheduled",
        executedDate: isImmediate ? new Date().toISOString() : null,
        ruleId: null,
        ruleName: null,
        eligibleCount: null,
        processedCount: isImmediate ? 1 : null,
        remarks: null,
      });

      // If immediate, also update the account balance and create transaction record
      if (isImmediate) {
        await updateAccountMutation.mutateAsync({
          id: account.id,
          data: { balance: Number(account.balance) + amount },
        });

        // Create transaction record
        await createTransactionMutation.mutateAsync({
          accountId: account.id,
          type: "top_up",
          amount: amount,
          description: "Individual Top-up",
          reference: `TOPUP-${Date.now()}`,
          status: "completed",
        });

        toast.success(
          `$${amount.toFixed(2)} credited to ${account.name}'s account`
        );
      }

      setIsIndividualDialogOpen(false);
      setSelectedAccount("");
      setTopUpAmount("");
      setScheduleDate("");
      setScheduleNow(true);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const scheduledCount = topUpSchedules.filter(
    (s) => s.status === "scheduled"
  ).length;
  const completedCount = topUpSchedules.filter(
    (s) => s.status === "completed"
  ).length;

  // Upcoming top-ups (all scheduled)
  const upcomingTopUps = useMemo(() => {
    return topUpSchedules
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
  }, [topUpSchedules]);

  // Filtered top-up schedules based on filters
  const filteredTopUpSchedules = useMemo(() => {
    let filtered = [...topUpSchedules];

    // Status filter
    if (statusFilter === "scheduled") {
      filtered = filtered.filter(
        (s) => s.status === "scheduled" || s.status === "processing"
      );
    } else if (statusFilter === "completed") {
      filtered = filtered.filter(
        (s) => s.status === "completed" || s.status === "failed"
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((s) => s.type === typeFilter);
    }

    // Amount filter
    if (amountFilter) {
      const amount = parseFloat(amountFilter);
      if (!isNaN(amount)) {
        filtered = filtered.filter((s) => Number(s.amount) >= amount);
      }
    }

    // Sort based on selected order
    return filtered.sort((a, b) => {
      if (sortOrder === "created_desc") {
        // Most recently created first
        const createdA = new Date(a.createdAt);
        const createdB = new Date(b.createdAt);
        return createdB.getTime() - createdA.getTime();
      } else if (sortOrder === "scheduled_earliest") {
        // Earliest scheduled date first
        const dateA = new Date(
          `${a.scheduledDate}T${a.scheduledTime || "00:00"}`
        );
        const dateB = new Date(
          `${b.scheduledDate}T${b.scheduledTime || "00:00"}`
        );
        return dateA.getTime() - dateB.getTime();
      } else {
        // Latest scheduled date first
        const dateA = new Date(
          `${a.scheduledDate}T${a.scheduledTime || "00:00"}`
        );
        const dateB = new Date(
          `${b.scheduledDate}T${b.scheduledTime || "00:00"}`
        );
        return dateB.getTime() - dateA.getTime();
      }
    });
  }, [topUpSchedules, statusFilter, typeFilter, amountFilter, sortOrder]);

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setAmountFilter("");
  };

  const hasActiveFilters =
    statusFilter !== "all" || typeFilter !== "all" || amountFilter !== "";

  const openExecuteConfirm = (rule: (typeof topUpRules)[0]) => {
    const eligibleCount = calculateEligibleAccounts(
      rule.minAge,
      rule.maxAge,
      rule.minBalance,
      rule.maxBalance,
      rule.inSchool,
      rule.educationLevel
    ).length;
    setRuleToExecute({
      id: rule.id,
      name: rule.name,
      amount: Number(rule.amount),
      eligibleCount,
    });
    setExecuteConfirmOpen(true);
  };

  const handleExecuteNow = async () => {
    if (!ruleToExecute) return;
    const rule = topUpRules.find((r) => r.id === ruleToExecute.id);
    if (!rule) return;

    try {
      const eligibleAccounts = calculateEligibleAccounts(
        rule.minAge,
        rule.maxAge,
        rule.minBalance,
        rule.maxBalance,
        rule.inSchool,
        rule.educationLevel
      );

      await createScheduleMutation.mutateAsync({
        type: "batch",
        scheduledDate: new Date().toISOString().split("T")[0],
        scheduledTime: new Date().toTimeString().slice(0, 5),
        amount: rule.amount,
        ruleId: rule.id,
        ruleName: rule.name,
        eligibleCount: eligibleAccounts.length,
        status: "processing",
        executedDate: null,
        processedCount: null,
        accountId: null,
        accountName: null,
        remarks: null,
      });

      toast.success("Batch top-up executing", {
        description: `"${rule.name}" is now being processed for ${eligibleAccounts.length} accounts.`,
      });

      setExecuteConfirmOpen(false);
      setRuleToExecute(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;
    try {
      await deleteRuleMutation.mutateAsync(ruleToDelete.id);
      setDeleteConfirmOpen(false);
      setRuleToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openDeleteConfirm = (rule: { id: string; name: string }) => {
    setRuleToDelete(rule);
    setDeleteConfirmOpen(true);
  };

  const openDeleteScheduleConfirm = (schedule: (typeof topUpSchedules)[0]) => {
    const name =
      schedule.type === "batch"
        ? schedule.ruleName || "Batch Top-up"
        : schedule.accountName || "Individual Top-up";
    setScheduleToDelete({ id: schedule.id, name });
    setDeleteScheduleConfirmOpen(true);
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    try {
      await deleteScheduleMutation.mutateAsync(scheduleToDelete.id);
      setDeleteScheduleConfirmOpen(false);
      setScheduleToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openEditDialog = (rule: (typeof topUpRules)[0]) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleAmount(String(rule.amount));
    setRuleMinAge(rule.minAge ? String(rule.minAge) : "");
    setRuleMaxAge(rule.maxAge ? String(rule.maxAge) : "");
    setRuleMinBalance(rule.minBalance !== null ? String(rule.minBalance) : "");
    setRuleMaxBalance(rule.maxBalance !== null ? String(rule.maxBalance) : "");
    setRuleInSchool(rule.inSchool || "any");
    setRuleEducationLevel(rule.educationLevel || "any");
    setIsEditDialogOpen(true);
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;
    if (!ruleName.trim()) {
      toast.error("Please enter a rule name");
      return;
    }
    if (!ruleAmount || parseFloat(ruleAmount) <= 0) {
      toast.error("Please enter a valid top-up amount");
      return;
    }

    try {
      await updateRuleMutation.mutateAsync({
        id: editingRule.id,
        data: {
          name: ruleName.trim(),
          amount: parseFloat(ruleAmount),
          minAge: ruleMinAge ? parseInt(ruleMinAge) : null,
          maxAge: ruleMaxAge ? parseInt(ruleMaxAge) : null,
          minBalance: ruleMinBalance ? parseFloat(ruleMinBalance) : null,
          maxBalance: ruleMaxBalance ? parseFloat(ruleMaxBalance) : null,
          inSchool: ruleInSchool === "any" ? null : ruleInSchool,
          educationLevel:
            ruleEducationLevel === "any" ? null : (ruleEducationLevel as any),
        },
      });

      // Reset form
      setEditingRule(null);
      setIsEditDialogOpen(false);
      setRuleName("");
      setRuleAmount("");
      setRuleMinAge("");
      setRuleMaxAge("");
      setRuleMinBalance("");
      setRuleMaxBalance("");
      setRuleInSchool("any");
      setRuleEducationLevel("any");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleToggleRule = (ruleId: string) => {
    setSelectedRules((prev) =>
      prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const handleSelectAllRules = () => {
    if (selectedRules.length === topUpRules.length) {
      setSelectedRules([]);
    } else {
      setSelectedRules(topUpRules.map((r) => r.id));
    }
  };

  const ruleColumns = [
    {
      key: "select",
      header: (
        <Checkbox
          checked={
            topUpRules.length > 0 && selectedRules.length === topUpRules.length
          }
          onCheckedChange={handleSelectAllRules}
        />
      ),
      render: (item: (typeof topUpRules)[0]) => (
        <Checkbox
          checked={selectedRules.includes(item.id)}
          onCheckedChange={() => handleToggleRule(item.id)}
        />
      ),
    },
    {
      key: "name",
      header: "Rule Name",
      render: (item: (typeof topUpRules)[0]) => (
        <span className="font-medium text-foreground">{item.name}</span>
      ),
    },
    {
      key: "criteria",
      header: "Criteria",
      render: (item: (typeof topUpRules)[0]) => {
        const criteria = [];
        if (item.minAge || item.maxAge) {
          criteria.push(`Age: ${item.minAge || 16}-${item.maxAge || 30}`);
        }
        if (item.minBalance !== undefined || item.maxBalance !== undefined) {
          criteria.push(
            `Balance: $${item.minBalance || 0}-$${item.maxBalance || "∞"}`
          );
        }
        if (item.inSchool) {
          criteria.push(
            item.inSchool === "in_school" ? "In School" : "Not in School"
          );
        }
        if (item.educationLevel) {
          const levelLabels: Record<string, string> = {
            primary: "Primary",
            secondary: "Secondary",
            post_secondary: "Post-Sec",
            tertiary: "Tertiary",
            postgraduate: "Postgrad",
          };
          criteria.push(
            levelLabels[item.educationLevel] || item.educationLevel
          );
        }
        if (item.continuingLearning) {
          criteria.push(`Cont. Learning: ${item.continuingLearning}`);
        }
        return (
          <div className="text-sm text-muted-foreground">
            {criteria.join(" • ")}
          </div>
        );
      },
    },
    {
      key: "amount",
      header: "Amount",
      render: (item: (typeof topUpRules)[0]) => (
        <span className="font-semibold text-success">
          ${Number(item.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: (typeof topUpRules)[0]) => (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => openExecuteConfirm(item)}
          >
            <Zap className="h-3 w-3 mr-1" />
            Execute Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRules([item.id]);
              setScheduleNow(false);
              setIsBatchScheduleDialogOpen(true);
            }}
          >
            <CalendarClock className="h-3 w-3 mr-1" />
            Schedule
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditDialog(item)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => openDeleteConfirm({ id: item.id, name: item.name })}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

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
          {item.type === "individual" && item.accountId ? (
            <button
              className="font-medium text-primary hover:underline text-left"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigateToStudent(item.accountId!);
              }}
            >
              {item.accountName}
            </button>
          ) : (
            <p className="font-medium text-foreground">{item.ruleName}</p>
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
      key: "eligibleCount",
      header: "Accounts",
      render: (item: (typeof topUpSchedules)[0]) => (
        <span className="text-muted-foreground">
          {item.type === "batch"
            ? `${item.eligibleCount} accounts`
            : "1 account"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: (typeof topUpSchedules)[0]) => (
        <StatusBadge status={item.status} />
      ),
    },
    {
      key: "scheduledDate",
      header: "Scheduled Date",
      render: (item: (typeof topUpSchedules)[0]) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {new Date(item.scheduledDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="text-xs text-muted-foreground">
            {item.scheduledTime ? item.scheduledTime.slice(0, 5) : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (item: (typeof topUpSchedules)[0]) => {
        const isUpcoming =
          item.status === "scheduled" || item.status === "processing";
        if (!isUpcoming) return null;

        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteScheduleConfirm(item);
            }}
            title="Delete scheduled top-up"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        );
      },
    },
  ];

  if (loadingRules || loadingSchedules) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading top-up data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Top-up Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage batch and individual account top-ups
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById("batch-rules-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Users className="h-4 w-4 mr-2" />
            Batch Top-up
          </Button>

          <Button
            variant="accent"
            onClick={() => setIsIndividualDialogOpen(true)}
          >
            <User className="h-4 w-4 mr-2" />
            Individual Top-up
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3">
        <StatCard
          title="Scheduled"
          value={scheduledCount}
          icon={CalendarClock}
          variant="accent"
          size="compact"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={Calendar}
          variant="primary"
          size="compact"
        />
        <StatCard
          title="Total"
          value={topUpSchedules.length}
          icon={Wallet}
          variant="default"
          size="compact"
        />
      </div>

      {/* Top-up Tracking */}
      <Card>
        <CardHeader className="pb-3">
          <div>
            <CardTitle>Top-up Tracking</CardTitle>
            <CardDescription>
              Track and manage all top-up operations
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filters:
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v: "all" | "scheduled" | "completed") =>
                setStatusFilter(v)
              }
            >
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Past/Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(v: "all" | "batch" | "individual") =>
                setTypeFilter(v)
              }
            >
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="batch">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Batch
                  </div>
                </SelectItem>
                <SelectItem value="individual">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Individual
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">
                Min Amount:
              </Label>
              <Input
                type="number"
                placeholder="$0"
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className="w-[100px] h-9"
                min="0"
              />
            </div>

            <Select
              value={sortOrder}
              onValueChange={(
                v: "created_desc" | "scheduled_earliest" | "scheduled_latest"
              ) => setSortOrder(v)}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">Recently Created</SelectItem>
                <SelectItem value="scheduled_earliest">
                  Scheduled (Earliest)
                </SelectItem>
                <SelectItem value="scheduled_latest">
                  Scheduled (Latest)
                </SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}

            <div className="ml-auto text-sm text-muted-foreground">
              Showing {filteredTopUpSchedules.length} of {topUpSchedules.length}{" "}
              records
            </div>
          </div>

          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status:{" "}
                  {statusFilter === "scheduled"
                    ? "Scheduled"
                    : "Past/Completed"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setStatusFilter("all")}
                  />
                </Badge>
              )}
              {typeFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {typeFilter === "batch" ? (
                    <Users className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  Type: {typeFilter === "batch" ? "Batch" : "Individual"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setTypeFilter("all")}
                  />
                </Badge>
              )}
              {amountFilter && (
                <Badge variant="secondary" className="gap-1">
                  Min Amount: ${amountFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setAmountFilter("")}
                  />
                </Badge>
              )}
            </div>
          )}

          <DataTable
            data={filteredTopUpSchedules}
            columns={scheduleColumns}
            emptyMessage="No top-ups match your filters"
          />
        </CardContent>
      </Card>

      {/* Batch Top-up Rules Section */}
      <Card id="batch-rules-section">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Top-Up Config List</CardTitle>
              <CardDescription>
                Configure rules for batch top-ups based on account criteria
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedRules.length > 0 && (
                <>
                  <Button
                    variant="default"
                    onClick={() => {
                      setScheduleNow(true);
                      setIsBatchScheduleDialogOpen(true);
                    }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Execute {selectedRules.length} Selected
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setScheduleNow(false);
                      setIsBatchScheduleDialogOpen(true);
                    }}
                  >
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Schedule Selected
                  </Button>
                </>
              )}
              <Dialog
                open={isRuleDialogOpen}
                onOpenChange={setIsRuleDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="accent">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Batch Top-up Rule</DialogTitle>
                    <DialogDescription>
                      Define criteria to automatically select accounts for batch
                      top-ups
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Rule Name */}
                    <div className="grid gap-2">
                      <Label>
                        Rule Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="e.g., Young Students Support"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Top-up Amount */}
                    <div className="grid gap-2">
                      <Label>
                        Top-up Amount ($){" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        placeholder="500"
                        min="0"
                        value={ruleAmount}
                        onChange={(e) => setRuleAmount(e.target.value)}
                        required
                      />
                    </div>

                    {/* Age Range */}
                    <div className="grid gap-2">
                      <Label>Age Range</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min age"
                          min="0"
                          max="100"
                          value={ruleMinAge}
                          onChange={(e) => setRuleMinAge(e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="number"
                          placeholder="Max age"
                          min="0"
                          max="100"
                          value={ruleMaxAge}
                          onChange={(e) => setRuleMaxAge(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave empty to include all ages
                      </p>
                    </div>

                    {/* Schooling Status */}
                    <div className="grid gap-2">
                      <Label>Schooling Status</Label>
                      <Select
                        value={ruleInSchool}
                        onValueChange={(
                          v: "in_school" | "not_in_school" | "any"
                        ) => setRuleInSchool(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="in_school">In School</SelectItem>
                          <SelectItem value="not_in_school">
                            Not in School
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Education Level */}
                    <div className="grid gap-2">
                      <Label>Education Level</Label>
                      <Select
                        value={ruleEducationLevel}
                        onValueChange={setRuleEducationLevel}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                          <SelectItem value="post_secondary">
                            Post-Secondary
                          </SelectItem>
                          <SelectItem value="tertiary">Tertiary</SelectItem>
                          <SelectItem value="postgraduate">
                            Postgraduate
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Balance Range */}
                    <div className="grid gap-2">
                      <Label>Balance Range ($)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min balance"
                          min="0"
                          value={ruleMinBalance}
                          onChange={(e) => setRuleMinBalance(e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="number"
                          placeholder="Max balance"
                          min="0"
                          value={ruleMaxBalance}
                          onChange={(e) => setRuleMaxBalance(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave empty to include all balances
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsRuleDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="accent"
                      onClick={handleCreateRule}
                      disabled={createRuleMutation.isPending}
                    >
                      {createRuleMutation.isPending ||
                      createScheduleMutation.isPending
                        ? "Creating..."
                        : "Create Rule"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={topUpRules}
            columns={ruleColumns}
            emptyMessage="No batch top-up rules configured"
          />
        </CardContent>
      </Card>

      {/* Individual Top-up Dialog */}
      <Dialog
        open={isIndividualDialogOpen}
        onOpenChange={setIsIndividualDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Individual Top-up</DialogTitle>
            <DialogDescription>
              Add funds to a specific student's account
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Search Account</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or NRIC..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Select Account</Label>
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAccountHolders.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex flex-col">
                        <span>{account.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {account.nric}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Top-up Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                min="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="schedule-now"
                checked={scheduleNow}
                onCheckedChange={(checked) => setScheduleNow(checked === true)}
              />
              <Label htmlFor="schedule-now">Execute immediately</Label>
            </div>
            {!scheduleNow && (
              <div className="grid gap-2">
                <Label>Schedule Date</Label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsIndividualDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleIndividualTopUp}
              disabled={createScheduleMutation.isPending}
            >
              {createScheduleMutation.isPending
                ? "Processing..."
                : "Submit Top-up"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Schedule Dialog */}
      <Dialog
        open={isBatchScheduleDialogOpen}
        onOpenChange={setIsBatchScheduleDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Batch Top-up</DialogTitle>
            <DialogDescription>
              Select one or more rules for batch top-up execution
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Select Rules ({selectedRules.length} selected)</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                {topUpRules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No rules available
                  </p>
                ) : (
                  topUpRules.map((rule) => {
                    const isSelected = selectedRules.includes(rule.id);
                    const eligibleCount = calculateEligibleAccounts(
                      rule.minAge,
                      rule.maxAge,
                      rule.minBalance,
                      rule.maxBalance,
                      rule.inSchool,
                      rule.educationLevel
                    ).length;

                    return (
                      <div
                        key={rule.id}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          setSelectedRules((prev) =>
                            prev.includes(rule.id)
                              ? prev.filter((id) => id !== rule.id)
                              : [...prev, rule.id]
                          );
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {
                            setSelectedRules((prev) =>
                              prev.includes(rule.id)
                                ? prev.filter((id) => id !== rule.id)
                                : [...prev, rule.id]
                            );
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{rule.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${Number(rule.amount).toFixed(2)} • {eligibleCount}{" "}
                            eligible accounts
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {selectedRules.length > 0 && (
                <div className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded-md">
                  <span className="text-muted-foreground">Total amount:</span>
                  <span className="font-semibold text-success">
                    $
                    {topUpRules
                      .filter((r) => selectedRules.includes(r.id))
                      .reduce((sum, r) => sum + Number(r.amount), 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="batch-schedule-now"
                checked={scheduleNow}
                onCheckedChange={(checked) => setScheduleNow(checked === true)}
              />
              <Label htmlFor="batch-schedule-now">Execute immediately</Label>
            </div>
            {!scheduleNow && (
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Schedule Date</Label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Schedule Time</Label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsBatchScheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleScheduleBatchTopUp}
              disabled={
                createScheduleMutation.isPending || selectedRules.length === 0
              }
            >
              {createScheduleMutation.isPending
                ? "Scheduling..."
                : `Schedule ${
                    selectedRules.length > 1
                      ? `${selectedRules.length} Top-ups`
                      : "Top-up"
                  }`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Top-Up Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the rule "{ruleToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRuleToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Rule Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingRule(null);
            setRuleName("");
            setRuleAmount("");
            setRuleMinAge("");
            setRuleMaxAge("");
            setRuleMinBalance("");
            setRuleMaxBalance("");
            setRuleInSchool("any");
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Top-up Rule</DialogTitle>
            <DialogDescription>
              Modify the criteria for this batch top-up rule
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Rule Name */}
            <div className="grid gap-2">
              <Label>Rule Name</Label>
              <Input
                placeholder="e.g., Young Students Support"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
              />
            </div>

            {/* Top-up Amount */}
            <div className="grid gap-2">
              <Label>Top-up Amount ($)</Label>
              <Input
                type="number"
                placeholder="500"
                min="0"
                value={ruleAmount}
                onChange={(e) => setRuleAmount(e.target.value)}
              />
            </div>

            {/* Age Range */}
            <div className="grid gap-2">
              <Label>Age Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min age"
                  min="0"
                  max="100"
                  value={ruleMinAge}
                  onChange={(e) => setRuleMinAge(e.target.value)}
                  className="flex-1"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max age"
                  min="0"
                  max="100"
                  value={ruleMaxAge}
                  onChange={(e) => setRuleMaxAge(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to include all ages
              </p>
            </div>

            {/* Schooling Status */}
            <div className="grid gap-2">
              <Label>Schooling Status</Label>
              <Select
                value={ruleInSchool}
                onValueChange={(v: "in_school" | "not_in_school" | "any") =>
                  setRuleInSchool(v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="in_school">In School</SelectItem>
                  <SelectItem value="not_in_school">Not in School</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Education Level */}
            <div className="grid gap-2">
              <Label>Education Level</Label>
              <Select
                value={ruleEducationLevel}
                onValueChange={setRuleEducationLevel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="post_secondary">Post-Secondary</SelectItem>
                  <SelectItem value="tertiary">Tertiary</SelectItem>
                  <SelectItem value="postgraduate">Postgraduate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Balance Range */}
            <div className="grid gap-2">
              <Label>Balance Range ($)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min balance"
                  min="0"
                  value={ruleMinBalance}
                  onChange={(e) => setRuleMinBalance(e.target.value)}
                  className="flex-1"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max balance"
                  min="0"
                  value={ruleMaxBalance}
                  onChange={(e) => setRuleMaxBalance(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to include all balances
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleUpdateRule}
              disabled={updateRuleMutation.isPending}
            >
              {updateRuleMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Execute Confirmation Dialog */}
      <AlertDialog
        open={executeConfirmOpen}
        onOpenChange={setExecuteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Execute Batch Top-Up</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to execute this batch top-up?</p>
              <div className="mt-3 p-3 bg-muted rounded-md space-y-1">
                <p className="font-medium text-foreground">
                  {ruleToExecute?.name}
                </p>
                <p className="text-sm">
                  Amount per account:{" "}
                  <span className="text-success font-semibold">
                    ${ruleToExecute?.amount.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm">
                  Eligible accounts:{" "}
                  <span className="font-semibold">
                    {ruleToExecute?.eligibleCount}
                  </span>
                </p>
                <p className="text-sm">
                  Total disbursement:{" "}
                  <span className="text-success font-semibold">
                    $
                    {(
                      (ruleToExecute?.amount || 0) *
                      (ruleToExecute?.eligibleCount || 0)
                    ).toFixed(2)}
                  </span>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRuleToExecute(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecuteNow}
              disabled={createScheduleMutation.isPending}
            >
              {createScheduleMutation.isPending
                ? "Processing..."
                : "Execute Now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Schedule Confirmation Dialog */}
      <AlertDialog
        open={deleteScheduleConfirmOpen}
        onOpenChange={setDeleteScheduleConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scheduled Top-Up</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scheduled top-up? This action
              cannot be undone.
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="font-medium text-foreground">
                  {scheduleToDelete?.name}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setScheduleToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSchedule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteScheduleMutation.isPending}
            >
              {deleteScheduleMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

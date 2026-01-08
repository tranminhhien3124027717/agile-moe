import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  Download,
  UserPlus,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useAccountHolders,
  useCreateAccountHolder,
} from "@/hooks/useAccountHolders";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useCourses } from "@/hooks/useCourses";
import { useCourseCharges } from "@/hooks/useCourseCharges";
import { nricRegistryService } from "@/lib/firestoreServices";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AccountManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [educationFilter, setEducationFilter] = useState<string>("all");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Form state for adding student
  const [nric, setNric] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [mailingAddress, setMailingAddress] = useState("");
  const [inSchool, setInSchool] = useState<"in_school" | "not_in_school">(
    "in_school"
  );
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [reason, setReason] = useState("");

  // Fetch data from database
  const { data: accountHolders = [], isLoading: loadingAccounts } =
    useAccountHolders();
  const { data: enrollments = [] } = useEnrollments();
  const { data: courses = [] } = useCourses();
  const { data: courseCharges = [] } = useCourseCharges();
  const createAccountMutation = useCreateAccountHolder();

  const filteredAccounts = accountHolders.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.nric.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || account.status === statusFilter;
    const matchesEducation =
      educationFilter === "all" || account.educationLevel === educationFilter;
    return matchesSearch && matchesStatus && matchesEducation;
  });

  const handleRowClick = (accountId: string) => {
    navigate(`/admin/accounts/${accountId}`);
  };

  // Get courses for a student
  const getStudentCourses = (accountId: string) => {
    const studentEnrollments = enrollments.filter(
      (e) => e.accountId === accountId && e.status === "active"
    );
    return studentEnrollments
      .map((e) => {
        const course = courses.find((c) => c.id === e.courseId);
        return course ? { ...course, enrollmentDate: e.enrollmentDate } : null;
      })
      .filter(Boolean);
  };

  // Get outstanding fees for a student
  const getStudentOutstandingFees = (accountId: string) => {
    return courseCharges.filter(
      (c) =>
        c.accountId === accountId &&
        (c.status === "pending" || c.status === "overdue")
    );
  };

  const resetForm = () => {
    setNric("");
    setFullName("");
    setDateOfBirth("");
    setEmail("");
    setPhone("");
    setResidentialAddress("");
    setMailingAddress("");
    setInSchool("in_school");
    setEducationLevel("");
    setReason("");
  };

  // Auto-fill handler for NRIC
  const handleNricBlur = async () => {
    const trimmedNric = nric.trim().toUpperCase();

    // Check if NRIC is 9 characters (e.g., S9107890E)
    if (trimmedNric.length === 9) {
      try {
        const registryData = await nricRegistryService.getByNric(trimmedNric);

        if (registryData) {
          // Auto-fill the fields
          setFullName(registryData.fullName);
          setDateOfBirth(registryData.dateOfBirth);
          toast.success("NRIC verified - Data auto-filled");
        } else {
          // NRIC not found in database
          toast.error("NRIC not found in database");
          setFullName("");
          setDateOfBirth("");
        }
      } catch (error) {
        console.error("Error fetching NRIC data:", error);
        toast.error("Error verifying NRIC");
      }
    }
  };

  const handleCreateAccount = async () => {
    if (!nric.trim()) {
      toast.error("Please enter NRIC");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Please enter full name");
      return;
    }
    if (!dateOfBirth) {
      toast.error("Please enter date of birth");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter email");
      return;
    }

    try {
      await createAccountMutation.mutateAsync({
        nric: nric.trim(),
        name: fullName.trim(),
        dateOfBirth: dateOfBirth,
        email: email.trim(),
        phone: phone.trim() || null,
        residentialAddress: residentialAddress.trim() || null,
        mailingAddress: mailingAddress.trim() || null,
        balance: 0,
        status: "active",
        inSchool: inSchool,
        educationLevel: (educationLevel || null) as any,
        continuingLearning: null,
      });
      resetForm();
      setIsAddStudentOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (loadingAccounts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Student Account Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage education accounts for Singapore Citizens (ages 16-30)
          </p>
        </div>
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogTrigger asChild>
            <Button variant="accent">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Manually create an education account for exception cases.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="nric">NRIC *</Label>
                  <Input
                    id="nric"
                    placeholder="S1234567A"
                    value={nric}
                    onChange={(e) => setNric(e.target.value)}
                    onBlur={handleNricBlur}
                    maxLength={9}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+65 9XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="educationLevel">Education Level</Label>
                  <Select
                    value={educationLevel}
                    onValueChange={setEducationLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="post_secondary">
                        Post-Secondary
                      </SelectItem>
                      <SelectItem value="tertiary">Tertiary</SelectItem>
                      <SelectItem value="postgraduate">Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="residentialAddress">Registered Address</Label>
                <Input
                  id="residentialAddress"
                  placeholder="Enter registered address"
                  value={residentialAddress}
                  onChange={(e) => setResidentialAddress(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mailingAddress">Mailing Address</Label>
                <Input
                  id="mailingAddress"
                  placeholder="Enter mailing address (if different)"
                  value={mailingAddress}
                  onChange={(e) => setMailingAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddStudentOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={handleCreateAccount}
                disabled={createAccountMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                {createAccountMutation.isPending
                  ? "Creating..."
                  : "Create Account"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or NRIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={educationFilter} onValueChange={setEducationFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Education Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
            <SelectItem value="post_secondary">Post-Secondary</SelectItem>
            <SelectItem value="tertiary">Tertiary</SelectItem>
            <SelectItem value="postgraduate">Postgraduate</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>NRIC</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Education Level</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Outstanding Fees</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No accounts found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => {
                const studentCourses = getStudentCourses(account.id);
                const outstandingFees = getStudentOutstandingFees(account.id);
                const totalOutstanding = outstandingFees.reduce(
                  (sum, f) => sum + Number(f.amount),
                  0
                );

                // Calculate age from date of birth
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

                console.log("AccountManagement Age Calculation:", {
                  accountId: account.id,
                  dateOfBirth: account.dateOfBirth,
                  birthDate: birthDate.toString(),
                  age,
                });

                // Education level labels
                const educationLevelLabels: Record<string, string> = {
                  primary: "Primary",
                  secondary: "Secondary",
                  post_secondary: "Post-Secondary",
                  tertiary: "Tertiary",
                  postgraduate: "Postgraduate",
                };

                return (
                  <TableRow
                    key={account.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(account.id)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {account.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {account.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {account.nric}
                    </TableCell>
                    <TableCell className="text-foreground">{age}</TableCell>
                    <TableCell className="font-semibold text-foreground">
                      ${Number(account.balance).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {account.educationLevel
                        ? educationLevelLabels[account.educationLevel] ||
                          account.educationLevel
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-accent" />
                        <span className="text-foreground">
                          {studentCourses.length}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {totalOutstanding > 0 ? (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-warning" />
                          <span className="font-semibold text-warning">
                            ${totalOutstanding.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-success text-sm">
                          No outstanding
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

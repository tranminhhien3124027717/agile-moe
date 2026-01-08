import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  Upload,
  FileSpreadsheet,
  X,
  Check,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  Course,
} from "@/hooks/useCourses";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useAccountHolders } from "@/hooks/useAccountHolders";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type BillingCycle = "monthly" | "quarterly" | "biannually" | "yearly";

interface ImportedCourse {
  name: string;
  provider: string;
  billingCycle: BillingCycle;
  fee: number;
  isValid: boolean;
  errors: string[];
}

const billingCycleLabels: Record<BillingCycle, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  biannually: "Biannually",
  yearly: "Yearly",
};

const SCHOOL_PROVIDERS = [
  "National University of Singapore",
  "Nanyang Technological University",
  "Singapore Management University",
  "Singapore Polytechnic",
  "Temasek Polytechnic",
] as const;

const CURRENCIES = [
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
] as const;

export default function CourseManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form state for new course
  const [courseName, setCourseName] = useState("");
  const [provider, setProvider] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currency, setCurrency] = useState("SGD");
  const [fee, setFee] = useState("");
  const [mainLocation, setMainLocation] = useState("");
  const [modeOfTraining, setModeOfTraining] = useState("online");
  const [registerBy, setRegisterBy] = useState("");
  const [courseRunStart, setCourseRunStart] = useState("");
  const [courseRunEnd, setCourseRunEnd] = useState("");
  const [intakeSize, setIntakeSize] = useState("");

  const [importedCourses, setImportedCourses] = useState<ImportedCourse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data from database
  const { data: courses = [], isLoading: loadingCourses } = useCourses();
  const { data: enrollments = [] } = useEnrollments();
  const { data: accountHolders = [] } = useAccountHolders();
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setCourseName("");
    setProvider("");
    setBillingCycle("monthly");
    setCurrency("SGD");
    setFee("");
    setMainLocation("");
    setModeOfTraining("online");
    setRegisterBy("");
    setCourseRunStart("");
    setCourseRunEnd("");
    setIntakeSize("");
  };

  const handleCreateCourse = async () => {
    if (!courseName.trim()) {
      toast.error("Please enter a course name");
      return;
    }
    if (!provider) {
      toast.error("Please select a provider");
      return;
    }
    if (!fee || parseFloat(fee) <= 0) {
      toast.error("Please enter a valid fee");
      return;
    }

    try {
      await createCourseMutation.mutateAsync({
        name: courseName.trim(),
        provider,
        billingCycle: billingCycle,
        fee: parseFloat(fee),
        status: "active",
        description: null,
        mainLocation: mainLocation || null,
        modeOfTraining: modeOfTraining,
        registerBy: registerBy || null,
        courseRunStart: courseRunStart || null,
        courseRunEnd: courseRunEnd || null,
        intakeSize: intakeSize ? parseInt(intakeSize) : 0,
      });
      resetForm();
      setIsCourseDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const parseBillingCycle = (value: string): BillingCycle | null => {
    const normalized = value?.toLowerCase()?.trim();
    if (["monthly", "month", "mo"].includes(normalized)) return "monthly";
    if (["quarterly", "quarter", "qtr"].includes(normalized))
      return "quarterly";
    if (["yearly", "year", "annual", "yr"].includes(normalized))
      return "yearly";
    return null;
  };

  const validateCourse = (row: Record<string, unknown>): ImportedCourse => {
    const errors: string[] = [];

    const name = String(
      row["Course Name"] || row["name"] || row["Name"] || ""
    ).trim();
    const providerVal = String(row["Provider"] || row["provider"] || "").trim();
    const billingValue = String(
      row["Billing Cycle"] || row["billingCycle"] || row["Billing"] || "monthly"
    );
    const feeValue = parseFloat(
      String(row["Fee"] || row["fee"] || row["Price"] || "0")
    );

    if (!name) errors.push("Course name is required");
    if (!providerVal) errors.push("Provider is required");

    const billing = parseBillingCycle(billingValue);
    if (!billing) errors.push("Invalid billing cycle");

    if (isNaN(feeValue) || feeValue <= 0) errors.push("Valid fee is required");

    return {
      name,
      provider: providerVal,
      billingCycle: billing || "monthly",
      fee: isNaN(feeValue) ? 0 : feeValue,
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<
        string,
        unknown
      >[];

      if (jsonData.length === 0) {
        toast.error("No data found in file");
        setIsProcessing(false);
        return;
      }

      const importedData = jsonData.map(validateCourse);
      setImportedCourses(importedData);
      setIsImportDialogOpen(true);
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Failed to parse file. Please check the format.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImportCourses = async () => {
    const validCourses = importedCourses.filter((c) => c.isValid);
    if (validCourses.length === 0) {
      toast.error("No valid courses to import");
      return;
    }

    try {
      for (const c of validCourses) {
        await createCourseMutation.mutateAsync({
          name: c.name,
          provider: c.provider,
          billingCycle: c.billingCycle,
          fee: c.fee,
          status: "active",
          description: null,
          mainLocation: null,
          modeOfTraining: "online",
          registerBy: null,
          courseRunStart: null,
          courseRunEnd: null,
          intakeSize: 0,
        });
      }
      toast.success(`${validCourses.length} course(s) imported successfully`);
      setIsImportDialogOpen(false);
      setImportedCourses([]);
    } catch (error) {
      toast.error("Failed to import some courses");
    }
  };

  const removeImportedCourse = (index: number) => {
    setImportedCourses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCourseClick = (course: Course) => {
    navigate(`/admin/courses/${course.id}/students`);
  };

  const handleEditCourse = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCourse(course);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    try {
      await updateCourseMutation.mutateAsync({
        id: editingCourse.id,
        data: {
          name: editingCourse.name,
          provider: editingCourse.provider,
          billingCycle: editingCourse.billingCycle,
          fee: editingCourse.fee,
          status: editingCourse.status,
          description: editingCourse.description,
          mainLocation: editingCourse.mainLocation,
          modeOfTraining: editingCourse.modeOfTraining,
          registerBy: editingCourse.registerBy,
          courseRunStart: editingCourse.courseRunStart,
          courseRunEnd: editingCourse.courseRunEnd,
          intakeSize: editingCourse.intakeSize,
        },
      });
      setIsEditDialogOpen(false);
      setEditingCourse(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const courseColumns = [
    {
      key: "courseId",
      header: "Course ID",
      render: (item: Course) => (
        <span className="font-mono text-sm text-muted-foreground">
          {item.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "name",
      header: "Course Name",
      render: (item: Course) => (
        <p className="font-medium text-foreground">{item.name}</p>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      render: (item: Course) => (
        <span className="text-muted-foreground">{item.provider}</span>
      ),
    },
    {
      key: "courseStart",
      header: "Course Start",
      render: (item: Course) => (
        <span className="text-muted-foreground">
          {item.courseRunStart
            ? new Date(item.courseRunStart).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
    {
      key: "courseEnd",
      header: "Course End",
      render: (item: Course) => (
        <span className="text-muted-foreground">
          {item.courseRunEnd
            ? new Date(item.courseRunEnd).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
    {
      key: "fee",
      header: "Fee",
      render: (item: Course) => (
        <span className="font-semibold text-foreground">
          ${Number(item.fee).toFixed(2)}/
          {item.billingCycle === "monthly"
            ? "mo"
            : item.billingCycle === "quarterly"
            ? "qtr"
            : "yr"}
        </span>
      ),
    },
    {
      key: "enrolled",
      header: "Enrolled",
      render: (item: Course) => {
        const count = enrollments.filter(
          (e) => e.courseId === item.id && e.status === "active"
        ).length;
        return <span className="text-muted-foreground">{count} students</span>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: Course) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleEditCourse(item, e)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (loadingCourses) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Course Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage courses and student enrollments. Click on a course to view
            enrolled students.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="course-file-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : "Import CSV/Excel"}
            </Button>
            <Dialog
              open={isCourseDialogOpen}
              onOpenChange={setIsCourseDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                  <DialogDescription>
                    Add a course to the education account system
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid gap-2">
                    <Label htmlFor="courseName">Course Name</Label>
                    <Input
                      id="courseName"
                      placeholder="e.g., Python Programming"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Provider</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select school" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOL_PROVIDERS.map((school) => (
                          <SelectItem key={school} value={school}>
                            {school}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="courseRunStart">Course Start Date</Label>
                      <Input
                        id="courseRunStart"
                        type="date"
                        value={courseRunStart}
                        onChange={(e) => setCourseRunStart(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="courseRunEnd">Course End Date</Label>
                      <Input
                        id="courseRunEnd"
                        type="date"
                        value={courseRunEnd}
                        onChange={(e) => setCourseRunEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Billing Cycle</Label>
                    <Select
                      value={billingCycle}
                      onValueChange={(value: BillingCycle) =>
                        setBillingCycle(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="biannually">Biannually</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.symbol} {c.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fee">
                        Fee ({billingCycleLabels[billingCycle]})
                      </Label>
                      <Input
                        id="fee"
                        type="number"
                        placeholder={
                          billingCycle === "monthly"
                            ? "250"
                            : billingCycle === "quarterly"
                            ? "700"
                            : billingCycle === "biannually"
                            ? "1500"
                            : "2500"
                        }
                        min="0"
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Total Fee (Yearly)</Label>
                    <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted text-muted-foreground">
                      {fee
                        ? `${currency} ${(
                            parseFloat(fee) *
                            (billingCycle === "monthly"
                              ? 12
                              : billingCycle === "quarterly"
                              ? 4
                              : billingCycle === "biannually"
                              ? 2
                              : 1)
                          ).toFixed(2)}`
                        : "-"}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsCourseDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    onClick={handleCreateCourse}
                    disabled={createCourseMutation.isPending}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {createCourseMutation.isPending
                      ? "Creating..."
                      : "Add Course"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Import Preview Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import Preview
              </DialogTitle>
              <DialogDescription>
                Review the courses to be imported. Invalid entries will be
                skipped.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {importedCourses.map((course, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      course.isValid
                        ? "border-border bg-card"
                        : "border-destructive/50 bg-destructive/10"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {course.isValid ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                          <span className="font-medium">
                            {course.name || "Unnamed"}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {course.provider} •{" "}
                          {billingCycleLabels[course.billingCycle]} • $
                          {course.fee.toFixed(2)}
                        </div>
                        {!course.isValid && (
                          <div className="text-xs text-destructive mt-1">
                            {course.errors.join(", ")}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeImportedCourse(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {importedCourses.filter((c) => c.isValid).length} of{" "}
                {importedCourses.length} valid
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsImportDialogOpen(false);
                    setImportedCourses([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="accent"
                  onClick={handleImportCourses}
                  disabled={
                    importedCourses.filter((c) => c.isValid).length === 0
                  }
                >
                  Import {importedCourses.filter((c) => c.isValid).length}{" "}
                  Course(s)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Course Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>Update course details</DialogDescription>
            </DialogHeader>
            {editingCourse && (
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="editCourseName">Course Name</Label>
                  <Input
                    id="editCourseName"
                    value={editingCourse.name}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Provider</Label>
                  <Select
                    value={editingCourse.provider}
                    onValueChange={(value) =>
                      setEditingCourse({ ...editingCourse, provider: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOOL_PROVIDERS.map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editCourseRunStart">
                      Course Start Date
                    </Label>
                    <Input
                      id="editCourseRunStart"
                      type="date"
                      value={editingCourse.courseRunStart || ""}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          courseRunStart: e.target.value || null,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editCourseRunEnd">Course End Date</Label>
                    <Input
                      id="editCourseRunEnd"
                      type="date"
                      value={editingCourse.courseRunEnd || ""}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          courseRunEnd: e.target.value || null,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Billing Cycle</Label>
                  <Select
                    value={editingCourse.billingCycle}
                    onValueChange={(value: BillingCycle) =>
                      setEditingCourse({
                        ...editingCourse,
                        billingCycle: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="biannually">Biannually</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editFee">
                    Fee ({billingCycleLabels[editingCourse.billingCycle]})
                  </Label>
                  <Input
                    id="editFee"
                    type="number"
                    min="0"
                    value={editingCourse.fee}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        fee: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={editingCourse.status}
                    onValueChange={(value: "active" | "inactive") =>
                      setEditingCourse({ ...editingCourse, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingCourse(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={handleUpdateCourse}
                disabled={updateCourseMutation.isPending}
              >
                {updateCourseMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Courses Table */}
        <DataTable
          data={filteredCourses}
          columns={courseColumns}
          emptyMessage="No courses found"
          onRowClick={handleCourseClick}
        />
      </div>
    </div>
  );
}

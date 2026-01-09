// Firestore Types based on Supabase schema

export type AccountStatus = "active" | "inactive" | "closed" | "pending";
export type InSchoolStatus = "in_school" | "not_in_school";
export type EducationLevel =
  | "primary"
  | "secondary"
  | "post_secondary"
  | "tertiary"
  | "postgraduate";
export type ContinuingLearningStatus = "active" | "inactive" | "completed";
export type ChargeStatus = "paid" | "pending" | "outstanding";
export type CourseStatus = "active" | "inactive";
export type EnrollmentStatus = "active" | "completed" | "withdrawn";
export type RuleStatus = "active" | "inactive";
export type TopUpScheduleStatus =
  | "scheduled"
  | "processing"
  | "completed"
  | "canceled"
  | "failed";
export type TopUpScheduleType = "batch" | "individual";
export type TransactionStatus = "completed" | "pending" | "failed";
export type TransactionType = "top_up" | "course_fee" | "payment" | "refund";
export type BillingCycle = "monthly" | "quarterly" | "biannually" | "yearly";

export interface AccountHolder {
  id: string;
  nric: string;
  name: string;
  dateOfBirth: string;
  email: string;
  phone?: string;
  residentialAddress?: string;
  mailingAddress?: string;
  balance: number;
  status: AccountStatus;
  inSchool: InSchoolStatus;
  educationLevel?: EducationLevel;
  continuingLearning?: ContinuingLearningStatus;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface Course {
  id: string;
  name: string;
  provider: string;
  billingCycle: BillingCycle;
  fee: number;
  description?: string;
  status: CourseStatus;
  courseRunStart?: string;
  courseRunEnd?: string;
  intakeSize?: number;
  mainLocation?: string;
  modeOfTraining?: string;
  registerBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  accountId: string;
  courseId: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CourseCharge {
  id: string;
  accountId: string;
  courseId: string;
  courseName: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: ChargeStatus;
  paidDate?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  status: TransactionStatus;
  reference?: string;
  createdAt: string;
}

export interface TopUpRule {
  id: string;
  name: string;
  minAge?: number;
  maxAge?: number;
  minBalance?: number;
  maxBalance?: number;
  inSchool?: InSchoolStatus;
  educationLevel?: EducationLevel;
  continuingLearning?: ContinuingLearningStatus;
  amount: number;
  status: RuleStatus;
  validFrom?: string;
  validTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopUpSchedule {
  id: string;
  type: TopUpScheduleType;
  scheduledDate: string;
  scheduledTime?: string;
  executedDate?: string;
  status: TopUpScheduleStatus;
  amount: number;
  ruleId?: string;
  ruleName?: string;
  eligibleCount?: number;
  processedCount?: number;
  accountId?: string;
  accountName?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NricRegistry {
  id: string;
  nric: string;
  fullName: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
}

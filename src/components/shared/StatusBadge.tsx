import { cn } from "@/lib/utils";

type Status =
  | "active"
  | "inactive"
  | "pending"
  | "closed"
  | "completed"
  | "failed"
  | "paid"
  | "overdue"
  | "enrolled"
  | "graduated"
  | "not_enrolled"
  | "withdrawn"
  | "in_school"
  | "not_in_school"
  | "primary"
  | "secondary"
  | "post_secondary"
  | "tertiary"
  | "postgraduate"
  | "scheduled"
  | "processing"
  | "canceled"
  | "outstanding"
  | "clear"
  | "fully_paid"
  | "partially_paid";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-muted",
  pending: "bg-warning/10 text-warning border-warning/20",
  closed: "bg-muted text-muted-foreground border-muted",
  completed: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  paid: "bg-success/10 text-success border-success/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
  enrolled: "bg-accent/10 text-accent border-accent/20",
  graduated: "bg-primary/10 text-primary border-primary/20",
  not_enrolled: "bg-muted text-muted-foreground border-muted",
  withdrawn: "bg-muted text-muted-foreground border-muted",
  in_school: "bg-success/10 text-success border-success/20",
  not_in_school: "bg-muted text-muted-foreground border-muted",
  primary: "bg-accent/10 text-accent border-accent/20",
  secondary: "bg-accent/10 text-accent border-accent/20",
  post_secondary: "bg-primary/10 text-primary border-primary/20",
  tertiary: "bg-primary/10 text-primary border-primary/20",
  postgraduate: "bg-primary/10 text-primary border-primary/20",
  scheduled: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  canceled: "bg-muted text-muted-foreground border-muted",
  outstanding: "bg-warning/10 text-warning border-warning/20",
  clear: "bg-success/10 text-success border-success/20",
  fully_paid: "bg-success/10 text-success border-success/20",
  partially_paid: "bg-accent/10 text-accent border-accent/20",
};

const statusLabels: Record<Status, string> = {
  active: "Paid",
  inactive: "Outstanding",
  pending: "Outstanding",
  closed: "Paid",
  completed: "Fully Paid",
  failed: "Overdue",
  paid: "Paid",
  overdue: "Overdue",
  enrolled: "Paid",
  graduated: "Fully Paid",
  not_enrolled: "Outstanding",
  withdrawn: "Outstanding",
  in_school: "In School",
  not_in_school: "Not In School",
  primary: "Paid",
  secondary: "Paid",
  post_secondary: "Paid",
  tertiary: "Paid",
  postgraduate: "Paid",
  scheduled: "Scheduled",
  processing: "Scheduled",
  canceled: "Canceled",
  outstanding: "Outstanding",
  clear: "Fully Paid",
  fully_paid: "Fully Paid",
  partially_paid: "Paid",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

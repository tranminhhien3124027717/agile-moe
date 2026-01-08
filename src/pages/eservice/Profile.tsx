import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Save, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useUpdateAccountHolder } from "@/hooks/useAccountHolders";
import { useCurrentUser } from "@/contexts/CurrentUserContext";
import { toast } from "sonner";

export default function Profile() {
  const { currentUser, isLoading } = useCurrentUser();
  const updateAccountMutation = useUpdateAccountHolder();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    residentialAddress: "",
    mailingAddress: "",
  });

  // Update form data when currentUser loads
  useEffect(() => {
    if (currentUser) {
      setFormData({
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        residentialAddress: currentUser.residentialAddress || "",
        mailingAddress: currentUser.mailingAddress || "",
      });
    }
  }, [currentUser]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  const handleSave = async () => {
    await updateAccountMutation.mutateAsync({
      id: currentUser.id,
      data: {
        email: formData.email,
        phone: formData.phone || null,
        residentialAddress: formData.residentialAddress || null,
        mailingAddress: formData.mailingAddress || null,
      },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      residentialAddress: currentUser.residentialAddress || "",
      mailingAddress: currentUser.mailingAddress || "",
    });
    setIsEditing(false);
  };

  const dob = new Date(currentUser.dateOfBirth);
  const age = Math.floor(
    (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          View and update your personal information
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground text-2xl font-bold">
            {currentUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {currentUser.name}
            </h2>
          </div>
        </div>
      </div>

      {/* Read-only Information */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Personal Information
            </h3>
            <p className="text-sm text-muted-foreground">
              These details cannot be changed online
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Full Name
            </p>
            <p className="font-medium text-foreground">{currentUser.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              NRIC
            </p>
            <p className="font-medium text-foreground">{currentUser.nric}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Date of Birth
            </p>
            <p className="font-medium text-foreground">
              {dob.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}{" "}
              ({age} years old)
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Account Created
            </p>
            <p className="font-medium text-foreground">
              {new Date(currentUser.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Schooling Status
            </p>
            <div className="pt-1">
              <StatusBadge status={currentUser.inSchool} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Education Level
            </p>
            <p className="font-medium text-foreground">
              {currentUser.educationLevel
                ? currentUser.educationLevel
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                : "Not specified"}
            </p>
          </div>
        </div>
      </div>

      {/* Contact & Address Information */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Mail className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Contact & Address Information
              </h3>
              <p className="text-sm text-muted-foreground">
                {isEditing
                  ? "Edit your contact and address details"
                  : "Your contact and address details"}
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        <Separator />

        {isEditing ? (
          <div className="grid gap-6">
            {/* Contact Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Address Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="residential">Registered Address</Label>
                <Textarea
                  id="residential"
                  value={formData.residentialAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      residentialAddress: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mailing">Mailing Address</Label>
                <Textarea
                  id="mailing"
                  value={formData.mailingAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, mailingAddress: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Email Address
              </p>
              <p className="font-medium text-foreground">
                {formData.email || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Phone Number
              </p>
              <p className="font-medium text-foreground">
                {formData.phone || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Registered Address
              </p>
              <p className="font-medium text-foreground">
                {formData.residentialAddress || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Mailing Address
              </p>
              <p className="font-medium text-foreground">
                {formData.mailingAddress || "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Save/Cancel Buttons - Only show when editing */}
      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={handleSave}
            disabled={updateAccountMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateAccountMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}

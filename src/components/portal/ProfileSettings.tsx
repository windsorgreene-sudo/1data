import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Bell, BellRing, Upload, Trash2, Camera, Loader2, Calendar, Shield } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().max(100, "Name must be less than 100 characters").optional(),
});

interface NotificationPreferences {
  notification_email_tickets: boolean;
  notification_email_invoices: boolean;
  notification_push_enabled: boolean;
}

export const ProfileSettings = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    notification_email_tickets: true,
    notification_email_invoices: true,
    notification_push_enabled: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setUserId(session.user.id);
      setEmail(session.user.email || "");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setFullName(profile.full_name || "");
        setAvatarUrl(profile.avatar_url);
        setCreatedAt(new Date(profile.created_at));
        setUpdatedAt(new Date(profile.updated_at));
        setNotifications({
          notification_email_tickets: profile.notification_email_tickets ?? true,
          notification_email_invoices: profile.notification_email_invoices ?? true,
          notification_push_enabled: profile.notification_push_enabled ?? true,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const validation = profileSchema.safeParse({ full_name: fullName });
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0]?.message,
          variant: "destructive",
        });
        return;
      }

      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          ...notifications,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your settings have been saved successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPG, PNG, WebP, or GIF image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingAvatar(true);

      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // Delete existing avatar if any
      if (avatarUrl) {
        const oldPath = avatarUrl.split("/").slice(-2).join("/");
        await supabase.storage.from("avatars").remove([oldPath]);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;

    try {
      setUploadingAvatar(true);

      const filePath = avatarUrl.split("/").slice(-2).join("/");
      await supabase.storage.from("avatars").remove([filePath]);

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (error) throw error;

      setAvatarUrl(null);
      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed",
      });
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Error",
        description: "Failed to remove profile picture",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Information */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src={avatarUrl || undefined} alt={fullName || "Profile"} />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/20 to-accent/20">
                  {getInitials(fullName || email)}
                </AvatarFallback>
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                {avatarUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP or GIF. Max 5MB.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <Separator />

          {/* Name & Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                Email Address
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              </Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive in-app toast notifications</p>
              </div>
            </div>
            <Switch
              checked={notifications.notification_push_enabled}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, notification_push_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Ticket Email Notifications</p>
                <p className="text-sm text-muted-foreground">Get emails when your support tickets are updated</p>
              </div>
            </div>
            <Switch
              checked={notifications.notification_email_tickets}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, notification_email_tickets: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Invoice Email Notifications</p>
                <p className="text-sm text-muted-foreground">Get emails for new invoices and payment confirmations</p>
              </div>
            </div>
            <Switch
              checked={notifications.notification_email_invoices}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, notification_email_invoices: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View your account details and security status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Member Since</span>
              </div>
              <p className="font-semibold">
                {createdAt?.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Last Updated</span>
              </div>
              <p className="font-semibold">
                {updatedAt?.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveProfile}
          disabled={saving}
          className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
};
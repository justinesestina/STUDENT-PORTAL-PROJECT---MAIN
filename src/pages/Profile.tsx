import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Edit,
  Save,
  X,
  Camera,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/useFileUpload";

const Profile: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    email: profile?.email || "",
    mobile_number: profile?.mobile_number || "",
    address: profile?.address || "",
    emergency_contact: profile?.emergency_contact || "",
  });
  const [loading, setLoading] = useState(false);
  const { uploadFile, uploading } = useFileUpload();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        mobile_number: formData.mobile_number,
        address: formData.address,
        emergency_contact: formData.emergency_contact,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
      await refreshProfile();
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      email: profile?.email || "",
      mobile_number: profile?.mobile_number || "",
      address: profile?.address || "",
      emergency_contact: profile?.emergency_contact || "",
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const publicUrl = await uploadFile(file, { bucket: "avatars" });
      
      if (publicUrl) {
        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: publicUrl })
          .eq("id", profile.id);
        
        if (error) throw error;
        
        toast.success("Profile picture updated!");
        await refreshProfile();
      }
    } catch (error) {
      toast.error("Failed to upload profile picture");
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "ST";
  };

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Profile & Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 mb-4 ring-4 ring-primary/20">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      ) : (
                        <Camera className="h-8 w-8 text-white" />
                      )}
                    </label>
                  </div>
                  <h3 className="text-lg font-semibold">{profile?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.course}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{profile?.year_level}</Badge>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{profile?.student_number}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Click on the avatar to upload a new picture
                  </p>
                </CardContent>
              </Card>

              {/* Personal Information Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile?.first_name || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile?.last_name || "-"}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="flex items-center gap-2 text-sm py-2 px-3 bg-muted rounded-md">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {profile?.email}
                      <Badge variant="outline" className="ml-auto text-xs">Verified</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile_number">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="mobile_number"
                        name="mobile_number"
                        value={formData.mobile_number}
                        onChange={handleChange}
                        placeholder="+63 912 345 6789"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm py-2 px-3 bg-muted rounded-md">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {profile?.mobile_number || "Not set"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Main Street, City"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm py-2 px-3 bg-muted rounded-md">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {profile?.address || "Not set"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    {isEditing ? (
                      <Input
                        id="emergency_contact"
                        name="emergency_contact"
                        value={formData.emergency_contact}
                        onChange={handleChange}
                        placeholder="Name - Phone Number"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">{profile?.emergency_contact || "Not set"}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Academic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Student Number</Label>
                      <p className="font-medium">{profile?.student_number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Program</Label>
                      <p className="font-medium">{profile?.course || "Not assigned"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Year Level</Label>
                      <p className="font-medium">{profile?.year_level || "Not assigned"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Status</Label>
                      <Badge className="bg-success/20 text-success">Active</Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Enrolled Since</Label>
                      <p className="font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Grade Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified when grades are posted</p>
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Announcements</p>
                    <p className="text-sm text-muted-foreground">Receive school announcements</p>
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">Who can see your profile</p>
                  </div>
                  <Badge variant="secondary">Classmates Only</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Show Grades</p>
                    <p className="text-sm text-muted-foreground">Display grades on profile</p>
                  </div>
                  <Badge variant="secondary">Hidden</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed: Never</p>
                  </div>
                  <Button variant="outline" size="sm">Change Password</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Badge variant="outline">Not Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Active Sessions</p>
                    <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                  </div>
                  <Button variant="outline" size="sm">View Sessions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default Profile;

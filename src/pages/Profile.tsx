import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Edit,
  Save,
  X
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
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-3xl bg-muted">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">{profile?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.course}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{profile?.year_level}</Badge>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{profile?.student_number}</span>
                  </div>
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
                        <p className="text-sm py-2">{profile?.first_name || "-"}</p>
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
                        <p className="text-sm py-2">{profile?.last_name || "-"}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="flex items-center gap-2 text-sm py-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {profile?.email}
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
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm py-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {profile?.mobile_number || "-"}
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
                        placeholder="123 Campus Drive, University City"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm py-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {profile?.address || "-"}
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
                        placeholder="Jane Doe - (555) 987-6543"
                      />
                    ) : (
                      <p className="text-sm py-2">{profile?.emergency_contact || "-"}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="academic">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Academic information will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Notification settings will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Privacy settings will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Security settings will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default Profile;

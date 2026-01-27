import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAnnouncements } from "@/hooks/useAdminData";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { createNotificationForAllStudents } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Calendar,
} from "lucide-react";

type Announcement = Tables<"announcements">;

interface AnnouncementForm {
  title: string;
  content: string;
}

const defaultForm: AnnouncementForm = {
  title: "",
  content: "",
};

const AdminAnnouncements: React.FC = () => {
  const { announcements, loading, refetch } = useAdminAnnouncements();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(defaultForm);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleOpenForm = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setForm({
        title: announcement.title || "",
        content: announcement.content || "",
      });
    } else {
      setEditingAnnouncement(null);
      setForm(defaultForm);
    }
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingAnnouncement) {
        const { error } = await supabase
          .from("announcements")
          .update({
            title: form.title,
            content: form.content,
          })
          .eq("id", editingAnnouncement.id);

        if (error) throw error;
        toast.success("Announcement updated successfully");
      } else {
        const { error } = await supabase.from("announcements").insert({
          title: form.title,
          content: form.content,
        });

        if (error) throw error;
        
        // Create notifications for all students
        await createNotificationForAllStudents(
          "📢 New Announcement",
          form.title,
          "info",
          "/dashboard"
        );
        
        toast.success("Announcement published and students notified!");
      }

      setFormOpen(false);
      setForm(defaultForm);
      refetch();
    } catch (error: any) {
      console.error("Error saving announcement:", error);
      toast.error(error.message || "Failed to save announcement");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAnnouncement) return;
    setFormLoading(true);

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", deletingAnnouncement.id);

      if (error) throw error;

      toast.success("Announcement deleted successfully");
      setDeleteOpen(false);
      setDeletingAnnouncement(null);
      refetch();
    } catch (error: any) {
      console.error("Error deleting announcement:", error);
      toast.error(error.message || "Failed to delete announcement");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">Manage announcements for students</p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No announcements yet</h3>
              <p className="text-muted-foreground mb-4">Create your first announcement</p>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4" />
                        {announcement.created_at
                          ? format(new Date(announcement.created_at), "MMM d, yyyy 'at' h:mm a")
                          : "Unknown date"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenForm(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingAnnouncement(announcement);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
            <DialogDescription>
              {editingAnnouncement
                ? "Update the announcement details"
                : "Create a new announcement for students"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Announcement title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your announcement here..."
                rows={6}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAnnouncement ? "Update" : "Publish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Announcement"
        description={`Are you sure you want to delete "${deletingAnnouncement?.title}"?`}
        onConfirm={handleDelete}
        loading={formLoading}
      />
    </AdminLayout>
  );
};

export default AdminAnnouncements;

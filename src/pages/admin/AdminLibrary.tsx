import React, { useState } from "react";
import { 
  BookOpen, 
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Users,
  Book
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AdminLibrary: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    resource_type: "book",
    category: "",
    isbn: "",
    file_url: "",
    total_copies: "1",
    is_available: true,
  });

  const { data: resources, isLoading } = useQuery({
    queryKey: ["admin-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_resources")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: borrowings } = useQuery({
    queryKey: ["admin-borrowings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_borrowings")
        .select("*, student:profiles(full_name), resource:library_resources(title)")
        .order("borrowed_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("library_resources").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-library"] });
      toast.success("Resource added");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to add resource"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("library_resources").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-library"] });
      toast.success("Resource updated");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update resource"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("library_resources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-library"] });
      toast.success("Resource deleted");
    },
    onError: () => toast.error("Failed to delete resource"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      description: "",
      resource_type: "book",
      category: "",
      isbn: "",
      file_url: "",
      total_copies: "1",
      is_available: true,
    });
    setEditingResource(null);
  };

  const handleSubmit = () => {
    const copies = parseInt(formData.total_copies);
    const payload = {
      title: formData.title,
      author: formData.author,
      description: formData.description,
      resource_type: formData.resource_type,
      category: formData.category,
      isbn: formData.isbn || null,
      file_url: formData.file_url || null,
      total_copies: copies,
      available_copies: editingResource ? editingResource.available_copies : copies,
      is_available: formData.is_available,
    };

    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (resource: any) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      author: resource.author || "",
      description: resource.description || "",
      resource_type: resource.resource_type || "book",
      category: resource.category || "",
      isbn: resource.isbn || "",
      file_url: resource.file_url || "",
      total_copies: resource.total_copies?.toString() || "1",
      is_available: resource.is_available ?? true,
    });
    setIsDialogOpen(true);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "ebook": return "📱";
      case "video": return "🎥";
      case "article": return "📄";
      default: return "📚";
    }
  };

  const filteredResources = resources?.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBorrowings = borrowings?.filter(b => b.status === 'borrowed').length || 0;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Library Management</h1>
            <p className="text-muted-foreground">Manage library resources and borrowings</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Resource</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingResource ? "Edit Resource" : "Add Resource"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <Label>Author</Label>
                  <Input value={formData.author} onChange={(e) => setFormData(p => ({ ...p, author: e.target.value }))} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={formData.resource_type} onValueChange={(v) => setFormData(p => ({ ...p, resource_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="book">Book</SelectItem>
                        <SelectItem value="ebook">E-Book</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="journal">Journal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} placeholder="e.g., Science, History" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ISBN</Label>
                    <Input value={formData.isbn} onChange={(e) => setFormData(p => ({ ...p, isbn: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Total Copies</Label>
                    <Input type="number" value={formData.total_copies} onChange={(e) => setFormData(p => ({ ...p, total_copies: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>File/Link URL (for digital resources)</Label>
                  <Input value={formData.file_url} onChange={(e) => setFormData(p => ({ ...p, file_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Available</Label>
                  <Switch checked={formData.is_available} onCheckedChange={(c) => setFormData(p => ({ ...p, is_available: c }))} />
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingResource ? "Update Resource" : "Add Resource"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Resources</p>
                  <p className="text-2xl font-bold">{resources?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Borrowings</p>
                  <p className="text-2xl font-bold">{activeBorrowings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">{resources?.filter(r => r.is_available).length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search resources..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredResources?.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-all group overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <span className="text-4xl">{getResourceIcon(resource.resource_type || 'book')}</span>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">{resource.category || resource.resource_type}</Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(resource)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(resource.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{resource.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{resource.author || "Unknown"}</p>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-muted-foreground">{resource.available_copies}/{resource.total_copies} copies</span>
                  {resource.is_available ? (
                    <Badge className="bg-success/20 text-success text-xs">Available</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!filteredResources || filteredResources.length === 0) && (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No resources found</p>
          </Card>
        )}

        {/* Recent Borrowings */}
        {borrowings && borrowings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Borrowings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {borrowings.slice(0, 5).map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{b.resource?.title}</p>
                      <p className="text-sm text-muted-foreground">by {b.student?.full_name}</p>
                    </div>
                    <Badge variant={b.status === 'borrowed' ? 'default' : 'secondary'}>
                      {b.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLibrary;

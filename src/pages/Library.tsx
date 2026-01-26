import React, { useState } from "react";
import { 
  BookOpen, 
  Search,
  Filter,
  BookMarked,
  Clock,
  Download,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Library: React.FC = () => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["library-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_resources")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: borrowings, isLoading: borrowingsLoading, refetch: refetchBorrowings } = useQuery({
    queryKey: ["library-borrowings", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("library_borrowings")
        .select("*, resource:library_resources(*)")
        .eq("student_id", profile.id)
        .order("borrowed_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const handleBorrow = async (resourceId: string) => {
    if (!profile?.id) return;
    
    try {
      const { error } = await supabase
        .from("library_borrowings")
        .insert({
          student_id: profile.id,
          resource_id: resourceId,
          due_date: addDays(new Date(), 14).toISOString().split('T')[0],
        });
      
      if (error) throw error;
      toast.success("Resource borrowed successfully! Due in 14 days.");
      refetchBorrowings();
    } catch (error) {
      toast.error("Failed to borrow resource");
    }
  };

  const filteredResources = resources?.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = resourcesLoading || borrowingsLoading;

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "ebook":
        return "📱";
      case "video":
        return "🎥";
      case "article":
        return "📄";
      default:
        return "📚";
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Library & Resources</h1>
            <p className="text-muted-foreground">Access books, e-books, and learning materials</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary">
              <BookMarked className="h-3 w-3 mr-1" />
              {borrowings?.filter(b => b.status === 'borrowed').length || 0} Borrowed
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search books, authors, or categories..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="borrowed">My Borrowed</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            {filteredResources && filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map((resource) => {
                  const isBorrowed = borrowings?.some(b => b.resource_id === resource.id && b.status === 'borrowed');
                  
                  return (
                    <Card key={resource.id} className="hover:shadow-lg transition-all duration-300 group overflow-hidden">
                      <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <span className="text-5xl">{getResourceIcon(resource.resource_type || 'book')}</span>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {resource.category || resource.resource_type}
                          </Badge>
                          {resource.is_available && resource.available_copies && resource.available_copies > 0 ? (
                            <Badge className="bg-success/20 text-success text-xs">Available</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-1">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">{resource.author || "Unknown Author"}</p>
                        
                        <div className="flex items-center gap-2">
                          {resource.file_url ? (
                            <Button size="sm" className="flex-1" asChild>
                              <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </a>
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              disabled={isBorrowed || !resource.is_available}
                              onClick={() => handleBorrow(resource.id)}
                            >
                              <BookMarked className="h-3 w-3 mr-1" />
                              {isBorrowed ? "Borrowed" : "Borrow"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No resources found matching your search" : "No resources available"}
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="borrowed">
            {borrowings?.filter(b => b.status === 'borrowed').length ? (
              <div className="space-y-4">
                {borrowings.filter(b => b.status === 'borrowed').map((borrowing: any) => (
                  <Card key={borrowing.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl">{getResourceIcon(borrowing.resource?.resource_type)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{borrowing.resource?.title}</p>
                          <p className="text-sm text-muted-foreground">{borrowing.resource?.author}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-warning text-sm">
                          <Clock className="h-4 w-4" />
                          Due: {borrowing.due_date && format(new Date(borrowing.due_date), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't borrowed any resources yet</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            {borrowings?.filter(b => b.status === 'returned').length ? (
              <div className="space-y-4">
                {borrowings.filter(b => b.status === 'returned').map((borrowing: any) => (
                  <Card key={borrowing.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-2xl">{getResourceIcon(borrowing.resource?.resource_type)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{borrowing.resource?.title}</p>
                          <p className="text-sm text-muted-foreground">{borrowing.resource?.author}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        Returned {borrowing.returned_at && format(new Date(borrowing.returned_at), "MMM d")}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No borrowing history</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default Library;

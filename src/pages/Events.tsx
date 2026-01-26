import React from "react";
import { 
  Calendar, 
  MapPin,
  Clock,
  Users,
  Tag,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isTomorrow, isThisWeek, isPast } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const Events: React.FC = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const upcomingEvents = events?.filter(e => !isPast(new Date(e.event_date))) || [];
  const pastEvents = events?.filter(e => isPast(new Date(e.event_date))) || [];

  const getEventTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "exam":
        return "bg-destructive/20 text-destructive";
      case "holiday":
        return "bg-success/20 text-success";
      case "deadline":
        return "bg-warning/20 text-warning";
      case "seminar":
        return "bg-info/20 text-info";
      case "workshop":
        return "bg-accent/20 text-accent-foreground";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date)) return format(date, "EEEE");
    return format(date, "MMM d, yyyy");
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Events & Activities</h1>
            <p className="text-muted-foreground">Stay updated with school events and important dates</p>
          </div>
          <Badge variant="outline" className="text-primary">
            <Calendar className="h-3 w-3 mr-1" />
            {upcomingEvents.length} Upcoming
          </Badge>
        </div>

        {/* Featured Events */}
        {upcomingEvents.length > 0 && upcomingEvents.slice(0, 2).some(e => isToday(new Date(e.event_date)) || isTomorrow(new Date(e.event_date))) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.filter(e => isToday(new Date(e.event_date)) || isTomorrow(new Date(e.event_date))).slice(0, 2).map((event) => (
              <Card key={event.id} className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <Badge className={getEventTypeColor(event.event_type || "event")}>
                        {event.event_type || "Event"}
                      </Badge>
                      <h3 className="text-xl font-bold">{event.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(event.event_date), "h:mm a")}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-center bg-card rounded-lg p-3 shadow-sm">
                      <p className="text-2xl font-bold text-primary">
                        {format(new Date(event.event_date), "d")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.event_date), "MMM")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upcoming Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => {
                  const eventDate = new Date(event.event_date);
                  return (
                    <div 
                      key={event.id} 
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-all hover:shadow-md group"
                    >
                      <div className="h-14 w-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-primary">
                          {format(eventDate, "d")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(eventDate, "MMM")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {event.title}
                          </h4>
                          <Badge className={`${getEventTypeColor(event.event_type || "event")} text-xs`}>
                            {event.event_type || "Event"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getDateLabel(eventDate)} at {format(eventDate, "h:mm a")}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground">Past Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastEvents.slice(0, 5).map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-center gap-4 p-3 rounded-lg border border-dashed opacity-60"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex flex-col items-center justify-center shrink-0">
                      <span className="text-sm font-medium">
                        {format(new Date(event.event_date), "d")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(event.event_date), "MMM")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.event_date), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Completed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
};

export default Events;

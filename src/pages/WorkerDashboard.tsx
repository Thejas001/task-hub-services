import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Star, CheckCircle, XCircle, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DashboardLayout from "../components/DashboardLayout";

const WorkerDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  const [jobRequests] = useState([
    { id: 1, customer: "Alice Johnson", service: "Kitchen Plumbing", date: "2024-01-20", time: "10:00 AM", status: "pending" },
    { id: 2, customer: "Bob Smith", service: "Bathroom Repair", date: "2024-01-22", time: "2:00 PM", status: "accepted" },
    { id: 3, customer: "Carol Davis", service: "Emergency Fix", date: "2024-01-25", time: "11:00 AM", status: "pending" },
  ]);

  const [completedJobs] = useState([
    { id: 1, customer: "John Doe", service: "Pipe Replacement", rating: 5, feedback: "Excellent work! Very professional and quick." },
    { id: 2, customer: "Jane Wilson", service: "Leak Repair", rating: 4, feedback: "Good service, arrived on time." },
    { id: 3, customer: "Mike Brown", service: "Water Heater", rating: 5, feedback: "Amazing! Fixed the issue perfectly." },
  ]);

  // Mock availability and bookings data
  const mySchedule = {
    "2024-01-15": [
      { time: "9:00 AM", customer: "Alice Johnson", service: "Kitchen Plumbing", status: "booked" },
      { time: "2:00 PM", status: "available" },
      { time: "4:00 PM", status: "available" },
    ],
    "2024-01-16": [
      { time: "10:00 AM", status: "available" },
      { time: "1:00 PM", customer: "Bob Smith", service: "Bathroom Repair", status: "booked" },
      { time: "3:00 PM", status: "available" },
    ],
    "2024-01-17": [
      { time: "9:00 AM", status: "available" },
      { time: "11:00 AM", customer: "Carol Davis", service: "Emergency Fix", status: "booked" },
      { time: "2:00 PM", status: "available" },
    ],
  };

  const bookedDates = Object.keys(mySchedule).filter(date => 
    mySchedule[date as keyof typeof mySchedule].some(slot => slot.status === 'booked')
  ).map(date => new Date(date));

  const availableDates = Object.keys(mySchedule).map(date => new Date(date));

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const daySchedule = mySchedule[selectedDateKey as keyof typeof mySchedule] || [];

  return (
    <DashboardLayout title="Worker Dashboard" userRole="worker">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jobs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">42</div>
            <p className="text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">4.8</div>
            <p className="text-sm text-gray-500">⭐ Out of 5 stars</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">$2,340</div>
            <p className="text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{request.customer}</h4>
                    <p className="text-primary font-medium">{request.service}</p>
                    <div className="text-sm text-muted-foreground mt-1">
                      📅 {request.date} • 🕐 {request.time}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'}>
                      {request.status}
                    </Badge>
                    {request.status === 'pending' && (
                      <>
                        <Button size="sm" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar and Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              My Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className={cn("w-full p-3 pointer-events-auto")}
              modifiers={{
                booked: bookedDates,
                available: availableDates,
              }}
              modifiersStyles={{
                booked: {
                  backgroundColor: 'hsl(var(--primary) / 0.2)',
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold'
                },
                available: {
                  backgroundColor: 'hsl(var(--secondary) / 0.3)',
                  border: '1px solid hsl(var(--primary) / 0.2)',
                }
              }}
            />
            
            {selectedDate && daySchedule.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {format(selectedDate, "MMM dd, yyyy")}
                </h4>
                <div className="space-y-2">
                  {daySchedule.map((slot, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-2 rounded border text-sm",
                        slot.status === 'booked' 
                          ? "bg-primary/10 border-primary/30" 
                          : "bg-secondary/50 border-secondary"
                      )}
                    >
                      <div className="font-medium">{slot.time}</div>
                      {slot.status === 'booked' ? (
                        <div className="text-xs text-muted-foreground">
                          {slot.customer} • {slot.service}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Available</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedJobs.map(job => (
                <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{job.customer}</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "h-4 w-4",
                            i < job.rating 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{job.service}</p>
                  <p className="text-sm text-muted-foreground">{job.feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WorkerDashboard;
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Star, CheckCircle, XCircle, Calendar as CalendarIcon, Clock, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DashboardLayout from "../components/DashboardLayout";
import { bookingService, type Booking } from "../services/bookingService";
import { jobPostService, type JobPost } from "../services/jobPostService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";

const WorkerDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { executeApiCall, isLoading } = useApi();
  const [employeeBookings, setEmployeeBookings] = useState<Booking[]>([]);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [newPost, setNewPost] = useState({ category: "", description: "", ratePerHour: "", ratePerDay: "", location: "" });
  const [applicationStatus, setApplicationStatus] = useState<"pending" | "accepted" | "rejected" | "not_found">("pending");
  const [hasApplication, setHasApplication] = useState<boolean>(true);
  const navigate = useNavigate();
  const isApproved = hasApplication && applicationStatus === 'accepted';

  // Derived UI data mapped from real bookings
  const jobRequests = useMemo(() => {
    return employeeBookings
      .filter(b => b.status === 'pending')
      .map(b => ({
        id: b.id,
        customer: b.customerName,
        service: b.workDescription,
        date: b.preferredDate,
        time: b.preferredTime,
        status: b.status,
        address: b.address,
        estimatedHours: b.estimatedHours,
        customerPhone: b.customerPhone,
        customerEmail: b.customerEmail
      }));
  }, [employeeBookings]);

  // Accepted jobs for the new section
  const acceptedJobs = useMemo(() => {
    return employeeBookings
      .filter(b => b.status === 'accepted')
      .map(b => ({
        id: b.id,
        customer: b.customerName,
        service: b.workDescription,
        date: b.preferredDate,
        time: b.preferredTime,
        status: b.status,
        address: b.address,
        estimatedHours: b.estimatedHours,
        customerPhone: b.customerPhone,
        customerEmail: b.customerEmail
      }));
  }, [employeeBookings]);

  const completedJobs = useMemo(() => {
    // Backend does not provide rating/feedback; keep design by using a default rating and simple feedback text
    return employeeBookings
      .filter(b => b.status === 'completed')
      .map(b => ({
        id: b.id,
        customer: b.customerName,
        service: b.workDescription,
        rating: 5,
        feedback: 'Job completed successfully.'
      }));
  }, [employeeBookings]);

  // Dummy reviews to display when there are no completed jobs yet
  const fallbackReviews = useMemo(() => ([
    { id: 101, customer: 'Anita Kumar', service: 'Kitchen Sink Repair', rating: 5, feedback: 'Very professional and quick fix. Highly recommended!' },
    { id: 102, customer: 'Rahul Menon', service: 'Pipe Leakage Fix', rating: 4, feedback: 'Good work. Arrived on time and resolved the issue.' },
    { id: 103, customer: 'Sara Thomas', service: 'Bathroom Fitting', rating: 5, feedback: 'Excellent workmanship and neat finish.' }
  ]), []);

  // Build schedule map by date from bookings
  const mySchedule = useMemo(() => {
    const schedule: Record<string, Array<{ time: string; customer?: string; service?: string; status: 'booked' | 'available' }>> = {};
    employeeBookings.forEach(b => {
      const key = b.preferredDate;
      if (!schedule[key]) schedule[key] = [];
      schedule[key].push({
        time: b.preferredTime,
        customer: b.customerName,
        service: b.workDescription,
        status: 'booked'
      });
    });
    return schedule;
  }, [employeeBookings]);

  const bookedDates = useMemo(() => Object.keys(mySchedule).map(d => new Date(d)), [mySchedule]);
  const availableDates = bookedDates;

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const daySchedule = (mySchedule as any)[selectedDateKey] || [];

  useEffect(() => {
    const load = async () => {
      // fetch worker application status first
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:5000/api/employee/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setApplicationStatus(data.applicationStatus);
          setHasApplication(true);
        } else if (res.status === 404) {
          setHasApplication(false);
          setApplicationStatus('not_found');
        }
      } catch {}

      const data = await executeApiCall(() => bookingService.getEmployeeBookings());
      if (data) setEmployeeBookings(data);
      const posts = await executeApiCall(() => jobPostService.getMyPosts());
      if (posts) setJobPosts(posts.jobPosts || []);
    };
    load();
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.category || !newPost.description || !newPost.location) return;
    const payload: any = {
      category: newPost.category,
      description: newPost.description,
      location: newPost.location
    };
    if (newPost.ratePerHour) payload.ratePerHour = Number(newPost.ratePerHour);
    if (newPost.ratePerDay) payload.ratePerDay = Number(newPost.ratePerDay);
    const res = await executeApiCall(() => jobPostService.create(payload));
    if (res) {
      setJobPosts(prev => [res.jobPost, ...prev]);
      setNewPost({ category: "", description: "", ratePerHour: "", ratePerDay: "", location: "" });
    }
  };

  const handleBookingStatusUpdate = async (bookingId: number, status: 'accepted' | 'rejected') => {
    try {
      const response = await executeApiCall(() => bookingService.updateBookingStatus(bookingId, status));
      if (response) {
        // Refresh the bookings data
        const data = await executeApiCall(() => bookingService.getEmployeeBookings());
        if (data) setEmployeeBookings(data);
        alert(`Booking ${status} successfully!`);
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
      alert('Failed to update booking status. Please try again.');
    }
  };

  // If application is pending, show only the pending message
  if (hasApplication && applicationStatus === 'pending') {
    return (
      <DashboardLayout title="Worker Dashboard" userRole="worker">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center">
                <Info className="h-5 w-5 text-primary" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Pending
                </Badge>
                <div className="text-lg font-medium">
                  Your application is under processing
                </div>
                <div className="text-sm text-muted-foreground">
                  Admin review in progress. You will be notified once your application is reviewed.
                </div>
                <div className="text-xs text-muted-foreground mt-4">
                  Access to job features will be available after approval.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // If application is rejected, show rejection message
  if (hasApplication && applicationStatus === 'rejected') {
    return (
      <DashboardLayout title="Worker Dashboard" userRole="worker">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center">
                <Info className="h-5 w-5 text-destructive" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  Rejected
                </Badge>
                <div className="text-lg font-medium">
                  Your application was rejected
                </div>
                <div className="text-sm text-muted-foreground">
                  Please contact support for more information.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Worker Dashboard" userRole="worker">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Application Status */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasApplication ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="font-medium">No application found</div>
                  <div className="text-sm text-muted-foreground">Complete your worker profile to submit an application.</div>
                </div>
                <Button onClick={() => navigate('/worker-complete-profile')} className="w-full sm:w-auto">Complete Profile</Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default">
                    Accepted
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    You are verified. Access full features.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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

      <div className={`grid lg:grid-cols-3 gap-6 ${!isApproved ? 'pointer-events-none opacity-60' : ''}`}>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobRequests.map(request => (
                <div key={request.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{request.customer}</h4>
                      <p className="text-primary font-medium">{request.service}</p>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <div className="flex items-center gap-4">
                          <span>📅 {new Date(request.date).toLocaleDateString()}</span>
                          <span>🕐 {request.time}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>📍 {request.address}</span>
                          <span>⏱️ {request.estimatedHours} hours</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>📞 {request.customerPhone}</span>
                          <span>✉️ {request.customerEmail}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'}>
                        {request.status}
                      </Badge>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleBookingStatusUpdate(request.id, 'accepted')}
                          >
                            <CheckCircle className="w-3 h-3" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-1"
                            onClick={() => handleBookingStatusUpdate(request.id, 'rejected')}
                          >
                            <XCircle className="w-3 h-3" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {jobRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg mb-2">No job requests yet</p>
                  <p>You'll see booking requests from customers here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Accepted Jobs Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Accepted Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {acceptedJobs.map(job => (
                <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-green-50 border-green-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{job.customer}</h4>
                      <p className="text-primary font-medium">{job.service}</p>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <div className="flex items-center gap-4">
                          <span>📅 {new Date(job.date).toLocaleDateString()}</span>
                          <span>🕐 {job.time}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>📍 {job.address}</span>
                          <span>⏱️ {job.estimatedHours} hours</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>📞 {job.customerPhone}</span>
                          <span>✉️ {job.customerEmail}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="default" className="bg-green-600">
                        Accepted
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBookingStatusUpdate(job.id, 'completed')}
                        className="gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {acceptedJobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg mb-2">No accepted jobs yet</p>
                  <p>Accepted job requests will appear here.</p>
                </div>
              )}
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
              {(completedJobs.length ? completedJobs : fallbackReviews).map(job => (
                <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{job.customer}</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "h-4 w-4",
                            i < (job as any).rating 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{(job as any).service}</p>
                  <p className="text-sm text-muted-foreground">{(job as any).feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Post Area */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Job Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm mb-1">Category</div>
                  <Input placeholder="e.g., Plumbing" value={newPost.category} onChange={(e) => setNewPost(p => ({ ...p, category: e.target.value }))} />
                </div>
                <div>
                  <div className="text-sm mb-1">Location</div>
                  <Input placeholder="City, Area" value={newPost.location} onChange={(e) => setNewPost(p => ({ ...p, location: e.target.value }))} />
                </div>
              </div>
              <div>
                <div className="text-sm mb-1">Description</div>
                <Textarea placeholder="Describe the service you offer" value={newPost.description} onChange={(e) => setNewPost(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm mb-1">Rate / Hour</div>
                  <Input type="number" placeholder="e.g., 500" value={newPost.ratePerHour} onChange={(e) => setNewPost(p => ({ ...p, ratePerHour: e.target.value }))} />
                </div>
                <div>
                  <div className="text-sm mb-1">Rate / Day</div>
                  <Input type="number" placeholder="e.g., 3500" value={newPost.ratePerDay} onChange={(e) => setNewPost(p => ({ ...p, ratePerDay: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCreatePost} disabled={!newPost.category || !newPost.description || !newPost.location}>Post Job</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Job Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobPosts.map((post) => (
                <div key={post.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{post.category}</div>
                      <div className="text-sm text-muted-foreground">{post.location}</div>
                    </div>
                    <Badge variant={post.status === 'active' ? 'default' : 'secondary'}>{post.status}</Badge>
                  </div>
                  <div className="mt-2 text-sm">{post.description}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {post.ratePerHour ? `₹${post.ratePerHour}/hr` : ''} {post.ratePerHour && post.ratePerDay ? '•' : ''} {post.ratePerDay ? `₹${post.ratePerDay}/day` : ''}
                  </div>
                </div>
              ))}
              {!jobPosts.length && (
                <div className="text-center text-sm text-muted-foreground">No job posts yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WorkerDashboard;
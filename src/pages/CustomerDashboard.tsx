import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Plus, Loader2, Clock, MapPin, RefreshCw, Filter } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useApi } from "../hooks/useApi";
import api from "../lib/api";

interface CustomerBooking {
  id: number;
  workerName: string;
  serviceType: string;
  workType: string;
  bookingDate: string;
  preferredTime: string;
  address: string;
  estimatedHours: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  workerPhone: string;
  amount: number;
}

interface CustomerProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  createdAt: string;
  bookings: CustomerBooking[];
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { executeApiCall, isLoading } = useApi();
  
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [myBookings, setMyBookings] = useState<CustomerBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<CustomerBooking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalSpent: 0
  });

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        const response = await api.get('/users/profile');
        const profileData = response.data;
        
        console.log('📊 Customer profile data received:', profileData);
        console.log('📋 Bookings data:', profileData.bookings);
        
        setProfile(profileData);
        setMyBookings(profileData.bookings || []);
        setFilteredBookings(profileData.bookings || []);
        
        // Calculate stats from real data
        const totalBookings = profileData.bookings?.length || 0;
        const activeBookings = profileData.bookings?.filter((b: CustomerBooking) => 
          b.status === 'pending' || b.status === 'accepted'
        ).length || 0;
        const totalSpent = profileData.bookings?.reduce((sum: number, b: CustomerBooking) => 
          sum + (b.amount || 0), 0
        ) || 0;
        
        setStats({
          totalBookings,
          activeBookings,
          totalSpent
        });
      } catch (error) {
        console.error('Failed to load customer data:', error);
      }
    };

    loadCustomerData();
  }, []);

  // Filter bookings based on status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredBookings(myBookings);
    } else {
      setFilteredBookings(myBookings.filter(booking => booking.status === statusFilter));
    }
  }, [myBookings, statusFilter]);

  const refreshBookings = async () => {
    try {
      const response = await api.get('/users/profile');
      const profileData = response.data;
      setMyBookings(profileData.bookings || []);
      setFilteredBookings(profileData.bookings || []);
    } catch (error) {
      console.error('Failed to refresh bookings:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Customer Dashboard" userRole="customer">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Customer Dashboard" userRole="customer">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalBookings}</div>
            <p className="text-sm text-gray-500">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.activeBookings}</div>
            <p className="text-sm text-gray-500">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">₹{stats.totalSpent.toLocaleString()}</div>
            <p className="text-sm text-gray-500">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              className="h-16 text-left justify-start gap-3"
              onClick={() => navigate('/find-workers')}
            >
              <Search className="h-6 w-6" />
              <div>
                <div className="font-semibold">Find Workers</div>
                <div className="text-sm opacity-90">Browse available service providers</div>
              </div>
            </Button>
            <Button 
              variant="outline"
              className="h-16 text-left justify-start gap-3"
              onClick={() => navigate('/find-workers')}
            >
              <Plus className="h-6 w-6" />
              <div>
                <div className="font-semibold">Book Service</div>
                <div className="text-sm opacity-90">Schedule a new appointment</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requested Work Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                My Work Applications
                <Badge variant="secondary" className="ml-2">
                  {filteredBookings.length} {statusFilter === 'all' ? 'Total' : statusFilter}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track all your service requests and their current status
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshBookings}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map(booking => (
                <div key={booking.id} className="p-6 border rounded-lg hover:shadow-md transition-all duration-200 bg-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-xl">{booking.workerName}</h4>
                        <Badge 
                          variant={
                            booking.status === 'completed' ? 'default' : 
                            booking.status === 'accepted' ? 'secondary' : 
                            booking.status === 'rejected' ? 'destructive' :
                            'outline'
                          }
                          className="text-xs"
                        >
                          {booking.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-primary font-medium text-lg">{booking.serviceType}</p>
                      <p className="text-sm text-muted-foreground mb-3">{booking.workType}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{booking.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.estimatedHours} hours
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Scheduled Date:</span>
                        <span>{new Date(booking.bookingDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Time:</span>
                        <span>{booking.preferredTime}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span className="truncate">{booking.address}</span>
                      </div>
                      {booking.workerPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Worker Contact:</span>
                          <span>{booking.workerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {booking.status === 'completed' && (
                      <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                        Rate & Review
                      </Button>
                    )}
                    {booking.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={async () => {
                            if (confirm('Are you sure you want to cancel this booking?')) {
                              try {
                                await executeApiCall(() => 
                                  api.put(`/bookings/${booking.id}/status`, { status: 'cancelled' })
                                );
                                alert('Booking cancelled successfully!');
                                window.location.reload();
                              } catch (error) {
                                console.error('Failed to cancel booking:', error);
                                alert('Failed to cancel booking. Please try again.');
                              }
                            }
                          }}
                        >
                          Cancel Request
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit Request
                        </Button>
                      </>
                    )}
                    {booking.status === 'accepted' && (
                      <>
                        <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700">
                          Contact Worker
                        </Button>
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                      </>
                    )}
                    {booking.status === 'rejected' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate('/find-workers')}
                      >
                        Find Another Worker
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => navigate(`/booking-details/${booking.id}`)}
                    >
                      View Full Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : myBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Work Applications Yet</h3>
              <p className="mb-6 max-w-md mx-auto">
                You haven't requested any services yet. Start by browsing available workers and submitting your first work request.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/find-workers')}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse Workers
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/find-workers')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Request Service
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No {statusFilter} Applications</h3>
              <p className="mb-6 max-w-md mx-auto">
                No work applications found with the selected status filter. Try changing the filter or create a new request.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => setStatusFilter('all')}
                >
                  Show All Applications
                </Button>
                <Button 
                  onClick={() => navigate('/find-workers')}
                >
                  Request New Service
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CustomerDashboard;

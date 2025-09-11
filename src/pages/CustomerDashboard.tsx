import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Plus } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const [myBookings] = useState([
    { id: 1, worker: "John Smith", service: "Plumbing", date: "2024-01-15", status: "completed", time: "10:00 AM", location: "Downtown" },
    { id: 2, worker: "Mary Johnson", service: "Cleaning", date: "2024-01-20", status: "in-progress", time: "2:00 PM", location: "Suburbs" },
    { id: 3, worker: "Bob Wilson", service: "Electrical", date: "2024-01-25", status: "upcoming", time: "11:00 AM", location: "Downtown" },
  ]);

  return (
    <DashboardLayout title="Customer Dashboard" userRole="customer">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">12</div>
            <p className="text-sm text-gray-500">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">2</div>
            <p className="text-sm text-gray-500">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">$890</div>
            <p className="text-sm text-gray-500">This year</p>
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

      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              My Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myBookings.map(booking => (
                <div key={booking.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{booking.worker}</h4>
                      <p className="text-primary font-medium">{booking.service}</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-4">
                          <span>📅 {booking.date}</span>
                          <span>🕐 {booking.time}</span>
                          <span>📍 {booking.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={
                          booking.status === 'completed' ? 'default' : 
                          booking.status === 'in-progress' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {booking.status}
                      </Badge>
                      <div className="flex gap-2">
                        {booking.status === 'completed' && (
                          <Button size="sm" variant="outline">Rate & Review</Button>
                        )}
                        {booking.status === 'upcoming' && (
                          <Button size="sm" variant="outline">Reschedule</Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => navigate(`/worker-profile/${booking.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {myBookings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg mb-2">No bookings yet</p>
                  <p className="mb-4">Start by finding and booking a service provider.</p>
                  <Button onClick={() => navigate('/find-workers')}>
                    Browse Workers
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
    </DashboardLayout>
  );
};

export default CustomerDashboard;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const CustomerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const [availableWorkers] = useState([
    { id: 1, name: "John Smith", service: "Plumbing", rating: 4.8, price: "$50/hr", availability: "Available", location: "Downtown" },
    { id: 2, name: "Mary Johnson", service: "Cleaning", rating: 4.9, price: "$30/hr", availability: "Available", location: "Suburbs" },
    { id: 3, name: "Bob Wilson", service: "Electrical", rating: 4.7, price: "$60/hr", availability: "Busy", location: "Downtown" },
    { id: 4, name: "Sarah Davis", service: "Gardening", rating: 4.6, price: "$35/hr", availability: "Available", location: "North End" },
    { id: 5, name: "Mike Brown", service: "Plumbing", rating: 4.5, price: "$55/hr", availability: "Available", location: "Suburbs" },
    { id: 6, name: "Lisa Garcia", service: "Electrical", rating: 4.8, price: "$65/hr", availability: "Available", location: "North End" },
  ]);

  const [myBookings] = useState([
    { id: 1, worker: "John Smith", service: "Plumbing", date: "2024-01-15", status: "completed" },
    { id: 2, worker: "Mary Johnson", service: "Cleaning", date: "2024-01-20", status: "in-progress" },
  ]);

  const filteredWorkers = availableWorkers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || worker.service === selectedCategory;
    const matchesLocation = selectedLocation === "all" || worker.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

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

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Find Workers</CardTitle>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Search workers by name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <div className="flex space-x-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Gardening">Gardening</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Downtown">Downtown</SelectItem>
                    <SelectItem value="Suburbs">Suburbs</SelectItem>
                    <SelectItem value="North End">North End</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredWorkers.map(worker => (
                <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{worker.name}</h4>
                    <p className="text-sm text-gray-600">{worker.service} • ⭐ {worker.rating} • {worker.price}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {worker.location}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={worker.availability === 'Available' ? 'default' : 'secondary'}>
                      {worker.availability}
                    </Badge>
                    <Button size="sm" disabled={worker.availability === 'Busy'}>
                      Book Now
                    </Button>
                  </div>
                </div>
              ))}
              {filteredWorkers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No workers found matching your criteria. Try adjusting your filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{booking.worker}</h4>
                    <p className="text-sm text-gray-600">{booking.service} • {booking.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                    {booking.status === 'completed' && (
                      <Button size="sm" variant="outline">Rate</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;

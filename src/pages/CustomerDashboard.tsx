
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "../components/DashboardLayout";

const CustomerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [availableWorkers] = useState([
    { id: 1, name: "John Smith", service: "Plumbing", rating: 4.8, price: "$50/hr", availability: "Available" },
    { id: 2, name: "Mary Johnson", service: "Cleaning", rating: 4.9, price: "$30/hr", availability: "Available" },
    { id: 3, name: "Bob Wilson", service: "Electrical", rating: 4.7, price: "$60/hr", availability: "Busy" },
  ]);

  const [myBookings] = useState([
    { id: 1, worker: "John Smith", service: "Plumbing", date: "2024-01-15", status: "completed" },
    { id: 2, worker: "Mary Johnson", service: "Cleaning", date: "2024-01-20", status: "in-progress" },
  ]);

  const filteredWorkers = availableWorkers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || worker.service === selectedCategory;
    return matchesSearch && matchesCategory;
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
            <div className="flex space-x-4 pt-4">
              <Input
                placeholder="Search workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Gardening">Gardening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredWorkers.map(worker => (
                <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{worker.name}</h4>
                    <p className="text-sm text-gray-600">{worker.service} • ⭐ {worker.rating} • {worker.price}</p>
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

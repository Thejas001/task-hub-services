
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Edit, Trash2, CheckCircle, XCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "../components/DashboardLayout";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  // Sample data - in real app this would come from database
  const [users] = useState([
    { id: 1, name: "John Smith", email: "john@email.com", role: "worker", status: "active", joinDate: "2024-01-15" },
    { id: 2, name: "Mary Johnson", email: "mary@email.com", role: "customer", status: "active", joinDate: "2024-01-20" },
    { id: 3, name: "Bob Wilson", email: "bob@email.com", role: "worker", status: "pending", joinDate: "2024-01-25" },
    { id: 4, name: "Sarah Davis", email: "sarah@email.com", role: "customer", status: "active", joinDate: "2024-02-01" },
  ]);

  const [pendingWorkers] = useState([
    { 
      id: 1, 
      name: "John Smith", 
      email: "john@email.com",
      service: "Plumbing", 
      experience: "5 years",
      location: "Downtown",
      phone: "+1-555-0123",
      documents: "ID, Certification"
    },
    { 
      id: 2, 
      name: "Mary Johnson", 
      email: "mary@email.com",
      service: "Cleaning", 
      experience: "3 years",
      location: "Suburbs",
      phone: "+1-555-0124",
      documents: "ID, References"
    },
  ]);

  const [allBookings] = useState([
    { 
      id: 1, 
      customer: "Alice Brown", 
      worker: "Bob Wilson", 
      service: "Electrical", 
      date: "2024-01-15",
      time: "10:00 AM",
      status: "completed",
      amount: "$120",
      location: "Downtown"
    },
    { 
      id: 2, 
      customer: "Tom Davis", 
      worker: "Sarah Lee", 
      service: "Gardening", 
      date: "2024-01-20",
      time: "2:00 PM",
      status: "in-progress",
      amount: "$80",
      location: "Suburbs"
    },
    { 
      id: 3, 
      customer: "Lisa Wilson", 
      worker: "Mike Brown", 
      service: "Plumbing", 
      date: "2024-01-22",
      time: "9:00 AM",
      status: "pending",
      amount: "$150",
      location: "North End"
    },
  ]);

  const [serviceCategories] = useState([
    { id: 1, name: "Plumbing", description: "Water pipe repairs and installations", activeWorkers: 12 },
    { id: 2, name: "Electrical", description: "Electrical repairs and installations", activeWorkers: 8 },
    { id: 3, name: "Cleaning", description: "House and office cleaning services", activeWorkers: 15 },
    { id: 4, name: "Gardening", description: "Garden maintenance and landscaping", activeWorkers: 6 },
  ]);

  const handleApproveWorker = (workerId: number) => {
    console.log("Approving worker:", workerId);
    toast({
      title: "Worker Approved",
      description: "Worker has been approved and can now accept jobs.",
    });
  };

  const handleRejectWorker = (workerId: number) => {
    console.log("Rejecting worker:", workerId);
    toast({
      title: "Worker Rejected", 
      description: "Worker application has been rejected.",
      variant: "destructive",
    });
  };

  const handleDeleteUser = (userId: number) => {
    console.log("Deleting user:", userId);
    toast({
      title: "User Deleted",
      description: "User has been permanently deleted from the system.",
      variant: "destructive",
    });
  };

  const handleEditUser = (userId: number) => {
    console.log("Editing user:", userId);
    toast({
      title: "User Updated",
      description: "User information has been updated successfully.",
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout title="Admin Dashboard" userRole="admin">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">1,234</div>
            <p className="text-sm text-gray-500">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">89</div>
            <p className="text-sm text-gray-500">+5% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">456</div>
            <p className="text-sm text-gray-500">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingWorkers.length}</div>
            <p className="text-sm text-gray-500">Workers awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Management Tabs */}
      <Tabs defaultValue="workers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workers">Worker Approvals</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="bookings">Booking Management</TabsTrigger>
          <TabsTrigger value="services">Service Categories</TabsTrigger>
        </TabsList>

        {/* Worker Approvals Tab */}
        <TabsContent value="workers">
          <Card>
            <CardHeader>
              <CardTitle>Pending Worker Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingWorkers.map(worker => (
                  <div key={worker.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">{worker.name}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>Email: {worker.email}</div>
                          <div>Service: {worker.service}</div>
                          <div>Experience: {worker.experience}</div>
                          <div>Location: {worker.location}</div>
                          <div>Phone: {worker.phone}</div>
                          <div>Documents: {worker.documents}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Worker Application Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Full Name</Label>
                                <Input value={worker.name} readOnly />
                              </div>
                              <div>
                                <Label>Email</Label>
                                <Input value={worker.email} readOnly />
                              </div>
                              <div>
                                <Label>Service Category</Label>
                                <Input value={worker.service} readOnly />
                              </div>
                              <div>
                                <Label>Experience</Label>
                                <Input value={worker.experience} readOnly />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleRejectWorker(worker.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveWorker(worker.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingWorkers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending worker applications.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <div className="flex space-x-4 pt-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Management Tab */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBookings.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">#{booking.id}</TableCell>
                      <TableCell>{booking.customer}</TableCell>
                      <TableCell>{booking.worker}</TableCell>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell>{booking.date} at {booking.time}</TableCell>
                      <TableCell>{booking.location}</TableCell>
                      <TableCell>{booking.amount}</TableCell>
                      <TableCell>
                        <Badge variant={
                          booking.status === 'completed' ? 'default' : 
                          booking.status === 'in-progress' ? 'secondary' : 'outline'
                        }>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Categories Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Categories Management</CardTitle>
              <Button className="w-fit">Add New Category</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Active Workers</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceCategories.map(category => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>{category.activeWorkers} workers</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminDashboard;

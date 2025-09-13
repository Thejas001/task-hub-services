

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Edit, Trash2, CheckCircle, XCircle, Eye, FileText, Plus } from "lucide-react";
import AdminWorkerManagement from "./AdminWorkerManagement";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "../components/DashboardLayout";
import { adminService, User, EmployeeApplication, DashboardStats } from "../services/adminService";
import { bookingService } from "../services/bookingService";
import { useApi } from "../hooks/useApi";
import { categoryService, ServiceCategory } from "../services/categoryService";
import { jobPostService, JobPost } from "../services/jobPostService";

interface JobPostsManagementProps {}

const JobPostsManagement = () => {
  console.log("JobPostsManagement mounted");
  const { toast } = useToast();
  const { executeApiCall } = useApi();
  
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    location: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  useEffect(() => {
    loadJobPosts();
  }, [filters]);

  useEffect(() => {
    const loadWorkTypes = async () => {
      try {
        const data = await categoryService.getWorkTypes();
        setWorkTypes(data.workTypes || []);
      } catch (error) {
        console.error('Failed to load work types:', error);
        // Fallback work types
        setWorkTypes(['Plumbing', 'Electrical', 'Cleaning', 'Gardening', 'Painting', 'Carpentry', 'AC Repair', 'Appliance Repair']);
      }
    };
    loadWorkTypes();
  }, []);

  const loadJobPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await executeApiCall(() => jobPostService.getAllPosts(filters));
      if (data) {
        setJobPosts(data.jobPosts || []);
      }
    } catch (error) {
      console.error('Error loading job posts:', error);
      setError('Failed to load job posts. Please try again.');
      toast({
        title: "Error loading job posts",
        description: "Failed to load job posts data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      status: '',
      location: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
  };

  return (
    <Card>
        <CardHeader>
          <CardTitle>All Job Posts ({jobPosts.length})</CardTitle>
        <div className="flex flex-wrap gap-4 pt-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by location..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full"
            />
          </div>
{/* Category Filter */}
<Select
  value={filters.category}
  onValueChange={(value) => handleFilterChange("category", value)}
>
  <SelectTrigger className="w-40">
    <SelectValue placeholder="Category" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="__all__">All Categories</SelectItem>
    {workTypes
      .filter((type) => type && type.trim() !== "")
      .map((type) => (
        <SelectItem key={type} value={type}>
          {type}
        </SelectItem>
      ))}
  </SelectContent>
</Select>

{/* Status Filter */}
<Select
  value={filters.status}
  onValueChange={(value) => handleFilterChange("status", value)}
>
  <SelectTrigger className="w-32">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="__all__">All Status</SelectItem>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="inactive">Inactive</SelectItem>
  </SelectContent>
</Select>

{/* Sort By Filter */}
<Select
  value={filters.sortBy}
  onValueChange={(value) => handleFilterChange("sortBy", value)}
>
  <SelectTrigger className="w-32">
    <SelectValue placeholder="Sort by" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="createdAt">Date</SelectItem>
    <SelectItem value="category">Category</SelectItem>
    <SelectItem value="location">Location</SelectItem>
    <SelectItem value="ratePerHour">Rate</SelectItem>
  </SelectContent>
</Select>

{/* Sort Order Filter */}
<Select
  value={filters.sortOrder}
  onValueChange={(value) => handleFilterChange("sortOrder", value)}
>
  <SelectTrigger className="w-24">
    <SelectValue placeholder="Order" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="DESC">Desc</SelectItem>
    <SelectItem value="ASC">Asc</SelectItem>
  </SelectContent>
</Select>

          <Button variant="outline" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8 text-red-500">
            <p className="text-lg font-semibold mb-2">Error</p>
            <p>{error}</p>
            <Button onClick={loadJobPosts} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading job posts...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobPosts.map(post => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">#{post.id}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{post.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{post.description}</TableCell>
                  <TableCell>
                    {(post as any).worker ? (
                      <div>
                        <div className="font-medium">{(post as any).worker.name}</div>
                        <div className="text-sm text-gray-500">{(post as any).worker.workType}</div>
                        {(post as any).worker.rating > 0 && (
                          <div className="text-sm text-yellow-600">
                            ⭐ {(post as any).worker.rating} ({(post as any).worker.totalReviews} reviews)
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">No worker assigned</span>
                    )}
                  </TableCell>
                  <TableCell>{post.location}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {post.ratePerHour && <div>₹{post.ratePerHour}/hr</div>}
                      {post.ratePerDay && <div>₹{post.ratePerDay}/day</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'active' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
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
        )}
        {jobPosts.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No job posts found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface AddWorkerFormProps {
  onWorkerAdded: () => void;
}

const AddWorkerForm = ({ onWorkerAdded }: AddWorkerFormProps) => {
  const { toast } = useToast();
  const { executeApiCall } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    mobileNumber: '',
    age: '',
    address: '',
    state: '',
    city: '',
    pinCode: '',
    nationality: '',
    workType: '',
    workExperience: '',
    hourlyRate: '',
    bio: '',
    skills: '',
    certifications: '',
    isAvailable: true,
    availableDays: '',
    availableTimeSlots: ''
  });
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const loadWorkTypes = async () => {
      try {
        const data = await categoryService.getWorkTypes();
        setWorkTypes(data.workTypes);
      } catch (error) {
        console.error('Failed to load work types:', error);
        // Fallback to hardcoded types if API fails
        setWorkTypes([
          'Plumbing', 'Electrical', 'Cleaning', 'Gardening', 
          'Painting', 'Carpentry', 'AC Repair', 'Appliance Repair'
        ]);
      }
    };
    loadWorkTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse JSON fields
      const skills = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];
      const certifications = formData.certifications ? formData.certifications.split(',').map(s => s.trim()).filter(s => s) : [];
      const availableDays = formData.availableDays ? formData.availableDays.split(',').map(s => s.trim()).filter(s => s) : [];
      const availableTimeSlots = formData.availableTimeSlots ? formData.availableTimeSlots.split(',').map(s => s.trim()).filter(s => s) : [];

      const workerData = {
        ...formData,
        age: parseInt(formData.age),
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        skills,
        certifications,
        availableDays,
        availableTimeSlots,
        applicationStatus: 'accepted', // Admin-created workers are automatically accepted
        isVerified: true,
        isBackgroundChecked: true
      };

      await executeApiCall(() => adminService.createWorker(workerData), {
        onSuccess: () => {
          toast({
            title: "Worker Created",
            description: "New worker has been added successfully.",
          });
          // Reset form
          setFormData({
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            password: '',
            mobileNumber: '',
            age: '',
            address: '',
            state: '',
            city: '',
            pinCode: '',
            nationality: '',
            workType: '',
            workExperience: '',
            hourlyRate: '',
            bio: '',
            skills: '',
            certifications: '',
            isAvailable: true,
            availableDays: '',
            availableTimeSlots: ''
          });
          onWorkerAdded();
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create worker.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Personal Information */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            value={formData.middleName}
            onChange={(e) => handleInputChange('middleName', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Mobile Number *</Label>
          <Input
            id="mobileNumber"
            value={formData.mobileNumber}
            onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality *</Label>
          <Input
            id="nationality"
            value={formData.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            required
          />
        </div>
        
        {/* Location Information */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pinCode">Pin Code *</Label>
          <Input
            id="pinCode"
            value={formData.pinCode}
            onChange={(e) => handleInputChange('pinCode', e.target.value)}
            required
          />
        </div>
        
        {/* Professional Information */}
        <div className="space-y-2">
          <Label htmlFor="workType">Work Type *</Label>
          <Select value={formData.workType} onValueChange={(value) => handleSelectChange('workType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your work type" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.title}>{cat.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="workExperience">Work Experience *</Label>
          <Input
            id="workExperience"
            value={formData.workExperience}
            onChange={(e) => handleInputChange('workExperience', e.target.value)}
            placeholder="e.g., 5 years"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
          <Input
            id="hourlyRate"
            type="number"
            value={formData.hourlyRate}
            onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
            placeholder="e.g., 500"
          />
        </div>
        
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Professional bio or description"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="skills">Skills (comma-separated)</Label>
          <Input
            id="skills"
            value={formData.skills}
            onChange={(e) => handleInputChange('skills', e.target.value)}
            placeholder="e.g., Emergency Repairs, Pipe Installation"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="certifications">Certifications (comma-separated)</Label>
          <Input
            id="certifications"
            value={formData.certifications}
            onChange={(e) => handleInputChange('certifications', e.target.value)}
            placeholder="e.g., Licensed Plumber, EPA Certified"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="availableDays">Available Days (comma-separated)</Label>
          <Input
            id="availableDays"
            value={formData.availableDays}
            onChange={(e) => handleInputChange('availableDays', e.target.value)}
            placeholder="e.g., Monday, Tuesday, Wednesday"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="availableTimeSlots">Available Time Slots (comma-separated)</Label>
          <Input
            id="availableTimeSlots"
            value={formData.availableTimeSlots}
            onChange={(e) => handleInputChange('availableTimeSlots', e.target.value)}
            placeholder="e.g., 09:00-17:00, 18:00-22:00"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          <Plus className="w-4 h-4" />
          {isSubmitting ? 'Creating...' : 'Create Worker'}
        </Button>
      </div>
    </form>
  );
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const { executeApiCall } = useApi();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  // Real data from backend
  const [users, setUsers] = useState<User[]>([]);
  const [pendingWorkers, setPendingWorkers] = useState<EmployeeApplication[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeWorkers: 0,
    totalBookings: 0,
    pendingApprovals: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Service categories (from API)
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState("");

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
    loadCategories();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load all data in parallel
      const [usersData, pendingWorkersData, bookingsData, statsData] = await Promise.all([
        executeApiCall(() => adminService.getAllUsers()),
        executeApiCall(() => adminService.getPendingEmployeeApplications()),
        executeApiCall(() => bookingService.getAllBookings()),
        executeApiCall(() => adminService.getDashboardStats())
      ]);

      if (usersData) setUsers(usersData);
      if (pendingWorkersData) setPendingWorkers(pendingWorkersData);
      if (bookingsData) setAllBookings(bookingsData);
      if (statsData) setDashboardStats(statsData);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const list = await categoryService.list();
      setServiceCategories(list);
    } catch (err) {
      // ignore for now
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatTitle.trim()) return;
    try {
      await categoryService.create({ title: newCatTitle.trim() });
      setIsAddCategoryOpen(false);
      setNewCatTitle("");
      loadCategories();
      toast({ title: "Category created" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
    }
  };

  const handleApproveWorker = async (workerId: number) => {
    try {
      await executeApiCall(() => adminService.approveEmployee(workerId), {
        onSuccess: () => {
          toast({
            title: "Worker Approved",
            description: "Worker has been approved and can now accept jobs.",
          });
          loadDashboardData(); // Refresh data
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve worker.",
        variant: "destructive",
      });
    }
  };

  const handleRejectWorker = async (workerId: number) => {
    try {
      await executeApiCall(() => adminService.rejectEmployee(workerId), {
        onSuccess: () => {
          toast({
            title: "Worker Rejected", 
            description: "Worker application has been rejected.",
            variant: "destructive",
          });
          loadDashboardData(); // Refresh data
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject worker.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await executeApiCall(() => adminService.deleteUser(userId), {
        onSuccess: () => {
          toast({
            title: "User Deleted",
            description: "User has been permanently deleted from the system.",
            variant: "destructive",
          });
          loadDashboardData(); // Refresh data
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async (userId: number, userData: Partial<User>) => {
    try {
      await executeApiCall(() => adminService.updateUser(userId, userData), {
        onSuccess: () => {
          toast({
            title: "User Updated",
            description: "User information has been updated successfully.",
          });
          loadDashboardData(); // Refresh data
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    }
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
            <div className="text-3xl font-bold text-blue-600">
              {isLoading ? "..." : dashboardStats.totalUsers}
            </div>
            <p className="text-sm text-gray-500">Registered users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {isLoading ? "..." : dashboardStats.activeWorkers}
            </div>
            <p className="text-sm text-gray-500">Approved workers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {isLoading ? "..." : dashboardStats.totalBookings}
            </div>
            <p className="text-sm text-gray-500">All bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {isLoading ? "..." : dashboardStats.pendingApprovals}
            </div>
            <p className="text-sm text-gray-500">Workers awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Management Tabs */}
      <Tabs defaultValue="add-worker" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="add-worker">Add Worker</TabsTrigger>
          <TabsTrigger value="worker-management">Worker Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="bookings">Booking Management</TabsTrigger>
          <TabsTrigger value="job-posts">Job Posts</TabsTrigger>
          <TabsTrigger value="services">Service Categories</TabsTrigger>
        </TabsList>

        {/* Add Worker Tab */}
        <TabsContent value="add-worker">
          <Card>
            <CardHeader>
              <CardTitle>Add New Worker</CardTitle>
            </CardHeader>
            <CardContent>
              <AddWorkerForm onWorkerAdded={loadDashboardData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Worker Management Tab */}
        <TabsContent value="worker-management">
          <AdminWorkerManagement />
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
                    <SelectItem value="User">Customer</SelectItem>
                    <SelectItem value="Employee">Worker</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
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
                        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditUser(user.id, user)}
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
                      <TableCell>{booking.customerName}</TableCell>
                      <TableCell>{booking.employee?.firstName} {booking.employee?.lastName}</TableCell>
                      <TableCell>{booking.workDescription}</TableCell>
                      <TableCell>{booking.preferredDate} at {booking.preferredTime}</TableCell>
                      <TableCell>{booking.address}</TableCell>
                      <TableCell>N/A</TableCell>
                      <TableCell>
                        <Badge variant={
                          booking.status === 'completed' ? 'default' : 
                          booking.status === 'accepted' ? 'secondary' : 'outline'
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

        {/* Job Posts Tab */}
        <TabsContent value="job-posts">
          <JobPostsManagement />
        </TabsContent>

        {/* Service Categories Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Categories Management</CardTitle>
              <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogTrigger asChild>
                  <Button className="w-fit">Add New Category</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Type</Label>
                      <Input value={newCatTitle} onChange={(e) => setNewCatTitle(e.target.value)} placeholder="e.g., Plumbing" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreateCategory}>Add</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
                      <TableCell className="font-medium">{category.title}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>{category.activeWorkers ?? '-'} workers</TableCell>
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

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, XCircle, Clock, Eye, Download, 
  Search, Filter, UserCheck, UserX, FileText,
  CreditCard, Calendar, Star, MapPin, Phone, Mail
} from "lucide-react";

interface WorkerApplication {
  id: number;
  userId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  age: number;
  workType: string;
  workExperience: string;
  hourlyRate: number;
  applicationStatus: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  profilePic?: string;
  bio?: string;
  skills: string[];
  certifications: string[];
  address: string;
  state: string;
  city: string;
  pinCode: string;
  nationality: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isBackgroundChecked: boolean;
  isAvailable: boolean;
  availableDays: any[];
  availableTimeSlots: any[];
  certificate?: string;
  aadharCard?: string;
  panCard?: string;
  idCard?: string;
  paymentStatus: string;
  paymentAmount: number;
}

const AdminWorkerManagement = () => {
  const [applications, setApplications] = useState<WorkerApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<WorkerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<WorkerApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, workTypeFilter]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/employee/pending-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data?.data || []);
        setApplications(list);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.workType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.applicationStatus === statusFilter);
    }

    // Work type filter
    if (workTypeFilter !== 'all') {
      filtered = filtered.filter(app => app.workType === workTypeFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleApprove = async (applicationId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/employee/approve/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Application approved successfully",
        });
        fetchApplications();
      } else {
        toast({
          title: "Error",
          description: "Failed to approve application",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (applicationId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/employee/reject/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Application rejected successfully",
        });
        setShowRejectionDialog(false);
        setRejectionReason('');
        fetchApplications();
      } else {
        toast({
          title: "Error",
          description: "Failed to reject application",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Worker Applications Management</h1>
          <p className="text-gray-600">Review and manage worker applications</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, or work type"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="workType">Work Type</Label>
                <Select value={workTypeFilter} onValueChange={setWorkTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Gardening">Gardening</SelectItem>
                    <SelectItem value="Painting">Painting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={fetchApplications} variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="grid gap-6">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
                <p className="text-gray-600">No applications match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        {application.profilePic ? (
                          <img 
                            src={application.profilePic} 
                            alt="Profile" 
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <UserCheck className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold">
                            {application.firstName} {application.lastName}
                          </h3>
                          {getStatusIcon(application.applicationStatus)}
                          {getStatusBadge(application.applicationStatus)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{application.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{application.mobileNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{application.city}, {application.state}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4" />
                            <span>{application.workType} • {application.workExperience}</span>
                          </div>
                        </div>
                        
                        {application.bio && (
                          <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                            {application.bio}
                          </p>
                        )}
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {application.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {application.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{application.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="text-right text-sm text-gray-600">
                        <p>Applied: {new Date(application.createdAt).toLocaleDateString()}</p>
                        <p>Rate: ₹{application.hourlyRate}/hour</p>
                        <div className="flex items-center justify-end space-x-1">
                          <CreditCard className="h-4 w-4" />
                          <span>Payment:</span>
                          <Badge className={`text-xs ${
                            application.paymentStatus === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {application.paymentStatus === 'completed' ? '✓ Paid' : '✗ Pending'}
                          </Badge>
                          <span>₹{application.paymentAmount}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Application Details</DialogTitle>
                              <DialogDescription>
                                Complete information for {application.firstName} {application.lastName}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Personal Information */}
                              <div>
                                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium">Name</p>
                                    <p>{application.firstName} {application.middleName || ''} {application.lastName}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Email</p>
                                    <p>{application.email}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Phone</p>
                                    <p>{application.mobileNumber}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Age</p>
                                    <p>{application.age}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Address</p>
                                    <p>{application.address}, {application.city}, {application.state} - {application.pinCode}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Nationality</p>
                                    <p>{application.nationality}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Professional Information */}
                              <div>
                                <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium">Work Type</p>
                                    <p>{application.workType}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Experience</p>
                                    <p>{application.workExperience}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Hourly Rate</p>
                                    <p>₹{application.hourlyRate}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Bio</p>
                                    <p>{application.bio || 'No bio provided'}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Skills and Certifications */}
                              <div>
                                <h3 className="text-lg font-semibold mb-3">Skills & Certifications</h3>
                                <div className="space-y-3">
                                  <div>
                                    <p className="font-medium text-sm">Skills</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {application.skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">Certifications</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {application.certifications.map((cert, index) => (
                                        <Badge key={index} variant="outline">
                                          {cert}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Documents */}
                              <div>
                                <h3 className="text-lg font-semibold mb-3">Documents</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium">Certificate</p>
                                    {application.certificate ? (
                                      <a href={`http://localhost:5000/${application.certificate}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
                                    ) : (
                                      <p>Not provided</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">Aadhar Card</p>
                                    {application.aadharCard ? (
                                      <a href={`http://localhost:5000/${application.aadharCard}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
                                    ) : (
                                      <p>Not provided</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">PAN Card</p>
                                    {application.panCard ? (
                                      <a href={`http://localhost:5000/${application.panCard}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
                                    ) : (
                                      <p>Not provided</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">ID Card</p>
                                    {application.idCard ? (
                                      <a href={`http://localhost:5000/${application.idCard}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
                                    ) : (
                                      <p>Not provided</p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Availability */}
                              <div>
                                <h3 className="text-lg font-semibold mb-3">Availability</h3>
                                <div className="text-sm">
                                  <p><span className="font-medium">Currently Available:</span> {application.isAvailable ? 'Yes' : 'No'}</p>
                                  {Array.isArray(application.availableDays) && application.availableDays.length > 0 && (
                                    <p className="mt-1"><span className="font-medium">Days:</span> {application.availableDays.join(', ')}</p>
                                  )}
                                  {Array.isArray(application.availableTimeSlots) && application.availableTimeSlots.length > 0 && (
                                    <div className="mt-1">
                                      <p className="font-medium">Time Slots:</p>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {application.availableTimeSlots.map((slot, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-xs">{typeof slot === 'string' ? slot : JSON.stringify(slot)}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {application.applicationStatus === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(application.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            
                            <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => setSelectedApplication(application)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Application</DialogTitle>
                                  <DialogDescription>
                                    Please provide a reason for rejecting this application.
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="reason">Rejection Reason</Label>
                                    <Textarea
                                      id="reason"
                                      placeholder="Enter the reason for rejection..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setShowRejectionDialog(false)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => handleReject(selectedApplication?.id || 0)}
                                    >
                                      Reject Application
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWorkerManagement;

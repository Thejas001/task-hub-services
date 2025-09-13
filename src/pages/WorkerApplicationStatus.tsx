import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, XCircle, FileText, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApplicationData {
  id: number;
  firstName: string;
  lastName: string;
  workType: string;
  applicationStatus: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  paymentStatus: string;
  paymentAmount: number;
}

const WorkerApplicationStatus = () => {
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/employee/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplicationData(data);
      } else if (response.status === 404) {
        // No application found - this is normal for new users
        const data = await response.json();
        setApplicationData({
          applicationStatus: 'not_found',
          hasApplication: false,
          message: 'No application found'
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch application status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching application status:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'accepted':
        return "Congratulations! Your application has been approved. You can now access the worker dashboard and start receiving job requests.";
      case 'rejected':
        return "Unfortunately, your application has been rejected. Please contact support for more information or submit a new application.";
      default:
        return "Your application is currently under review. Our admin team will review your profile and documents. You'll be notified once a decision is made.";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (!applicationData || !applicationData.hasApplication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">No Application Found</CardTitle>
            <CardDescription className="text-gray-600">
              You haven't completed your worker profile yet. Complete your profile to start working.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                Complete your worker profile and pay the registration fee to get started.
              </p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/worker-complete-profile')} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Complete Your Profile
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Status</h1>
          <p className="text-gray-600">Track your worker application progress</p>
        </div>

        <div className="grid gap-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(applicationData.applicationStatus)}
                  <div>
                    <CardTitle className="text-xl">Application Status</CardTitle>
                    <CardDescription>
                      {applicationData.firstName} {applicationData.lastName} - {applicationData.workType}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(applicationData.applicationStatus)}
              </div>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  {getStatusMessage(applicationData.applicationStatus)}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Application Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Application ID</p>
                  <p className="text-lg font-semibold">#{applicationData.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted On</p>
                  <p className="text-lg font-semibold">
                    {new Date(applicationData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Work Type</p>
                  <p className="text-lg font-semibold">{applicationData.workType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <p className="text-lg font-semibold text-green-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Registration Fee</p>
                  <p className="text-lg font-semibold">₹500</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {applicationData.applicationStatus === 'accepted' && (
              <Button 
                onClick={() => navigate('/worker-dashboard')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
              </Button>
            )}
            
            {applicationData.applicationStatus === 'rejected' && (
              <Button 
                onClick={() => navigate('/worker-complete-profile')}
                variant="outline"
              >
                Submit New Application
              </Button>
            )}
            
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerApplicationStatus;

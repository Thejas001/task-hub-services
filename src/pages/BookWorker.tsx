import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Clock, MapPin, Star, User } from "lucide-react";
import { useApi } from "../hooks/useApi";
import api from "../lib/api";
import { authService } from "../services/authService";

interface Worker {
  id: number;
  firstName: string;
  lastName: string;
  workType: string;
  rating: number | string;
  hourlyRate?: number | string;
  isAvailable: boolean;
  state: string;
  city?: string;
  workExperience: string;
  bio?: string;
  profilePic?: string;
  isVerified: boolean;
  totalReviews: number | string;
}

const BookWorker = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const { executeApiCall, isLoading } = useApi();
  
  const [worker, setWorker] = useState<Worker | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookingData, setBookingData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    workDescription: "",
    preferredDate: "",
    preferredTime: "",
    address: "",
    estimatedHours: "",
    specialRequirements: ""
  });

  useEffect(() => {
    const loadWorker = async () => {
      if (!workerId) return;
      
      try {
        const response = await api.get(`/employee/public`);
        const workers = response.data;
        const foundWorker = workers.find((w: Worker) => w.id === parseInt(workerId));
        console.log('🔍 Found worker:', foundWorker);
        console.log('🔍 Worker ID from URL:', workerId);
        setWorker(foundWorker);
      } catch (error) {
        console.error('Failed to load worker:', error);
      }
    };

    loadWorker();
  }, [workerId]);

  // Load current user profile to pre-fill form
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userProfile = await authService.getProfile();
        console.log('👤 Current user profile:', userProfile);
        setCurrentUser(userProfile);
        
        // Pre-fill form with user's information
        setBookingData(prev => ({
          ...prev,
          customerName: userProfile.firstName && userProfile.lastName 
            ? `${userProfile.firstName} ${userProfile.lastName}` 
            : userProfile.name || '',
          customerEmail: userProfile.email || '',
          customerPhone: userProfile.phoneNumber || ''
        }));
      } catch (error) {
        console.error('Failed to load current user profile:', error);
      }
    };

    loadCurrentUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!worker || !workerId) return;

    // Use current user's email to ensure bookings are associated with the logged-in user
    const customerEmail = currentUser?.email || bookingData.customerEmail;
    
    const bookingPayload = {
      workerId: parseInt(workerId),
      workerName: `${worker.firstName} ${worker.lastName}`,
      customerName: bookingData.customerName,
      customerEmail: customerEmail, // Use logged-in user's email
      customerPhone: bookingData.customerPhone,
      workType: worker.workType,
      workDescription: bookingData.workDescription,
      preferredDate: bookingData.preferredDate,
      preferredTime: bookingData.preferredTime,
      address: bookingData.address,
      estimatedHours: bookingData.estimatedHours ? parseFloat(bookingData.estimatedHours) : 1,
      specialRequirements: bookingData.specialRequirements,
      budget: bookingData.estimatedHours ? parseFloat(bookingData.estimatedHours) * Number(worker.hourlyRate) : 0,
      urgency: "normal"
    };

    try {
      console.log('📤 Sending booking payload:', bookingPayload);
      const response = await executeApiCall(() => api.post('/bookings/create', bookingPayload));
      if (response) {
        alert('Booking request submitted successfully! The worker will be notified.');
        navigate('/find-workers');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error response:', error.response);
      
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to submit booking request: ${errorMessage}`);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!worker) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Worker not found</h2>
              <Button onClick={() => navigate('/find-workers')}>
                Back to Find Workers
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/find-workers')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Find Workers
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-2xl font-bold">Book Worker</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Worker Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Worker Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{worker.firstName} {worker.lastName}</h3>
                  <p className="text-primary font-medium">{worker.workType}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{Number(worker.rating || 0).toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({worker.totalReviews || 0} reviews)</span>
                  {worker.isVerified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{worker.city ? `${worker.city}, ${worker.state}` : worker.state}</span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Experience: {worker.workExperience}
                </div>
                
                {worker.hourlyRate && (
                  <div className="text-lg font-semibold text-green-600">
                    ₹{Number(worker.hourlyRate).toLocaleString()}/hr
                  </div>
                )}
                
                {worker.bio && (
                  <p className="text-sm text-muted-foreground">
                    {worker.bio}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Request</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Your Name *</Label>
                      <Input
                        id="customerName"
                        value={bookingData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={bookingData.customerEmail}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                        required
                        disabled={!!currentUser?.email}
                      />
                      {currentUser?.email && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Using your account email: {currentUser.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerPhone">Phone Number *</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={bookingData.customerPhone}
                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedHours">Estimated Hours</Label>
                      <Input
                        id="estimatedHours"
                        type="number"
                        min="1"
                        step="0.5"
                        value={bookingData.estimatedHours}
                        onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                        placeholder="e.g., 2.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="workDescription">Work Description *</Label>
                    <Textarea
                      id="workDescription"
                      value={bookingData.workDescription}
                      onChange={(e) => handleInputChange('workDescription', e.target.value)}
                      placeholder="Describe the work you need done..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Service Address *</Label>
                    <Textarea
                      id="address"
                      value={bookingData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter the complete address where the work needs to be done..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredDate">Preferred Date *</Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        value={bookingData.preferredDate}
                        onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredTime">Preferred Time *</Label>
                      <Select value={bookingData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="13:00">1:00 PM</SelectItem>
                          <SelectItem value="14:00">2:00 PM</SelectItem>
                          <SelectItem value="15:00">3:00 PM</SelectItem>
                          <SelectItem value="16:00">4:00 PM</SelectItem>
                          <SelectItem value="17:00">5:00 PM</SelectItem>
                          <SelectItem value="18:00">6:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialRequirements">Special Requirements</Label>
                    <Textarea
                      id="specialRequirements"
                      value={bookingData.specialRequirements}
                      onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                      placeholder="Any special requirements or notes..."
                    />
                  </div>

                  {bookingData.estimatedHours && worker.hourlyRate && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900">Estimated Cost</h4>
                      <p className="text-blue-700">
                        {bookingData.estimatedHours} hours × ₹{Number(worker.hourlyRate).toLocaleString()}/hr = 
                        <span className="font-bold"> ₹{(parseFloat(bookingData.estimatedHours) * Number(worker.hourlyRate)).toLocaleString()}</span>
                      </p>
                      <p className="text-sm text-blue-600 mt-1">* Final cost may vary based on actual work required</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/find-workers')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Submitting...' : 'Submit Booking Request'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookWorker;

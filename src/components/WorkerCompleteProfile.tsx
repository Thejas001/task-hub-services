import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoryService, ServiceCategory } from "@/services/categoryService";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const WorkerCompleteProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    age: '',
    address: '',
    state: '',
    pinCode: '',
    city: '',
    mobileNumber: '',
    nationality: '',
    workExperience: '',
    workType: '',
    hourlyRate: '',
    bio: '',
    skills: [] as string[],
    certifications: [] as string[],
    availableDays: [] as string[],
    paymentMethod: 'razorpay'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  const skillsOptions = [
    'Emergency Repairs', 'Installation', 'Maintenance', 'Troubleshooting',
    'Quality Work', 'Timely Service', 'Customer Service', 'Problem Solving'
  ];

  const certificationOptions = [
    'Licensed Professional', 'Safety Certified', 'Industry Certified',
    'Quality Assurance', 'OSHA Trained', 'EPA Certified'
  ];

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (name: 'skills' | 'certifications' | 'availableDays', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }));
  };

  const createPaymentIntent = async () => {
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: 500,
          paymentType: 'registration_fee',
          description: 'Worker registration fee',
          paymentMethod: formData.paymentMethod
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPaymentIntent(data);
        return data;
      } else {
        throw new Error(data.message || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('Payment intent error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayment = async () => {
    // In a real implementation, you would integrate with Razorpay here
    // For now, we'll simulate a successful payment
    const paymentData = await createPaymentIntent();
    if (paymentData) {
      // Show payment success popup
      toast({
        title: "🎉 Payment Successful!",
        description: `Registration fee of ₹${paymentData.amount} paid successfully via ${paymentData.paymentMethod.toUpperCase()}.`,
        duration: 5000,
      });
      
      // Show additional success message
      setTimeout(() => {
        toast({
          title: "✅ Profile Submission",
          description: "Your worker profile is being submitted for admin review.",
          duration: 3000,
        });
      }, 1000);
      
      // Proceed with profile completion
      await handleSubmit(paymentData.orderId);
    }
  };

  const handleSubmit = async (transactionId?: string) => {
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'skills' || key === 'certifications' || key === 'availableDays') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });
      
      if (transactionId) {
        formDataToSend.append('transactionId', transactionId);
      }

      const response = await fetch('http://localhost:5000/api/employee/complete-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "🎉 Registration Complete!",
          description: "Your worker profile has been submitted successfully. You'll receive an email confirmation shortly.",
          duration: 5000,
        });
        
        // Show application status message
        setTimeout(() => {
          toast({
            title: "📋 Application Status",
            description: "Your application is now under admin review. You can check your status anytime.",
            duration: 4000,
          });
        }, 2000);
        
        // Navigate to worker dashboard where status is shown
        setTimeout(() => {
          navigate('/worker-dashboard');
        }, 3000);
      } else {
        if (data.message === 'Profile already completed') {
          toast({
            title: "Profile Already Exists",
            description: "You have already completed your profile. Redirecting to application status...",
            duration: 3000,
          });
          setTimeout(() => {
            navigate('/worker-dashboard');
          }, 2000);
        } else {
          setError(data.message || 'Profile completion failed');
          console.error('Profile completion error:', data);
        }
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Complete Your Worker Profile</CardTitle>
            <CardDescription className="text-center">
              Fill in your details and pay the registration fee to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobileNumber">Mobile Number *</Label>
                    <Input
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pinCode">PIN Code *</Label>
                    <Input
                      id="pinCode"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
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
                  <div>
                    <Label htmlFor="workExperience">Work Experience *</Label>
                    <Input
                      id="workExperience"
                      name="workExperience"
                      placeholder="e.g., 5 years"
                      value={formData.workExperience}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                  <Input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    placeholder="e.g., 500"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about your experience and expertise..."
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skills & Expertise</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {skillsOptions.map(skill => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={formData.skills.includes(skill)}
                        onCheckedChange={(checked) => handleArrayChange('skills', skill, checked as boolean)}
                      />
                      <Label htmlFor={skill} className="text-sm">{skill}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Certifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {certificationOptions.map(cert => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={cert}
                        checked={formData.certifications.includes(cert)}
                        onCheckedChange={(checked) => handleArrayChange('certifications', cert, checked as boolean)}
                      />
                      <Label htmlFor={cert} className="text-sm">{cert}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Availability</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={formData.availableDays.includes(day)}
                        onCheckedChange={(checked) => handleArrayChange('availableDays', day, checked as boolean)}
                      />
                      <Label htmlFor={day} className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Registration Fee</h3>
                
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      formData.paymentMethod === 'razorpay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`} onClick={() => setFormData(prev => ({...prev, paymentMethod: 'razorpay'}))}>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-500"></div>
                        <span className="font-medium">Razorpay</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Cards, UPI, Net Banking</p>
                    </div>
                    
                    <div className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      formData.paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`} onClick={() => setFormData(prev => ({...prev, paymentMethod: 'stripe'}))}>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-500"></div>
                        <span className="font-medium">Stripe</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">International Cards</p>
                    </div>
                    
                    <div className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      formData.paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`} onClick={() => setFormData(prev => ({...prev, paymentMethod: 'paypal'}))}>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-500"></div>
                        <span className="font-medium">PayPal</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">PayPal Account</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Registration Fee</p>
                      <p className="text-sm text-gray-600">One-time payment to join the platform</p>
                      {paymentLoading && (
                        <div className="flex items-center mt-2 text-sm text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Processing payment...
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">₹500</p>
                      {paymentIntent && (
                        <p className="text-xs text-green-600 mt-1">✓ Payment Ready</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || paymentLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {paymentLoading ? 'Processing Payment...' : loading ? 'Completing Profile...' : `Pay ₹500 & Complete Profile`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkerCompleteProfile;

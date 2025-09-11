import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon,
  ArrowLeft,
  CheckCircle,
  Award,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const WorkerProfile = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Mock worker data - in real app this would come from backend
  const workerData = {
    1: {
      id: 1,
      name: "John Smith",
      service: "Plumbing",
      rating: 4.8,
      reviewCount: 127,
      price: "$50/hr",
      location: "Downtown",
      phone: "(555) 123-4567",
      email: "john.smith@example.com",
      experience: "8 years",
      bio: "Professional plumber with expertise in residential and commercial plumbing systems. Specialized in emergency repairs, installation, and maintenance.",
      avatar: "/placeholder.svg",
      skills: ["Emergency Repairs", "Pipe Installation", "Leak Detection", "Water Heater Repair"],
      certifications: ["Licensed Plumber", "EPA Certified", "OSHA Safety Trained"],
      availability: {
        "2024-01-15": ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
        "2024-01-16": ["10:00 AM", "1:00 PM", "3:00 PM"],
        "2024-01-17": ["9:00 AM", "12:00 PM", "2:00 PM", "5:00 PM"],
        "2024-01-18": ["11:00 AM", "1:00 PM", "4:00 PM"],
        "2024-01-19": ["9:00 AM", "2:00 PM", "3:00 PM"],
      },
      reviews: [
        { id: 1, customer: "Alice Brown", rating: 5, comment: "Excellent work! Fixed my kitchen sink quickly and professionally.", date: "2024-01-10" },
        { id: 2, customer: "Mike Johnson", rating: 5, comment: "Very reliable and knowledgeable. Highly recommend!", date: "2024-01-08" },
        { id: 3, customer: "Sarah Wilson", rating: 4, comment: "Good service, arrived on time and got the job done.", date: "2024-01-05" },
      ]
    },
    2: {
      id: 2,
      name: "Mary Johnson",
      service: "Cleaning",
      rating: 4.9,
      reviewCount: 89,
      price: "$30/hr",
      location: "Suburbs",
      phone: "(555) 987-6543",
      email: "mary.johnson@example.com",
      experience: "5 years",
      bio: "Detail-oriented cleaning professional specializing in residential deep cleaning and regular maintenance services.",
      avatar: "/placeholder.svg",
      skills: ["Deep Cleaning", "Regular Maintenance", "Eco-Friendly Products", "Post-Construction Cleanup"],
      certifications: ["Bonded & Insured", "Green Cleaning Certified"],
      availability: {
        "2024-01-15": ["8:00 AM", "10:00 AM", "1:00 PM"],
        "2024-01-16": ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
        "2024-01-17": ["8:00 AM", "12:00 PM", "3:00 PM"],
        "2024-01-18": ["10:00 AM", "1:00 PM"],
        "2024-01-19": ["9:00 AM", "11:00 AM", "2:00 PM", "5:00 PM"],
      },
      reviews: [
        { id: 1, customer: "Tom Davis", rating: 5, comment: "Amazing attention to detail. House looks spotless!", date: "2024-01-12" },
        { id: 2, customer: "Lisa Garcia", rating: 5, comment: "Very professional and trustworthy. Regular weekly service.", date: "2024-01-09" },
      ]
    }
  };

  const worker = workerId ? workerData[Number(workerId) as keyof typeof workerData] : undefined;

  if (!worker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Worker Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested worker profile could not be found.</p>
            <Button onClick={() => navigate('/customer-dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableDates = Object.keys(worker.availability).map(date => new Date(date));
  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const availableTimes = worker.availability[selectedDateKey] || [];

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select date and time",
        description: "Both date and time are required to make a booking.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Booking Confirmed!",
      description: `Your appointment with ${worker.name} is scheduled for ${format(selectedDate, "PPP")} at ${selectedTime}.`,
    });
    
    setIsBookingOpen(false);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/customer-dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg font-semibold">Worker Profile</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={worker.avatar} />
                    <AvatarFallback className="text-lg">
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold">{worker.name}</h2>
                        <p className="text-xl text-primary font-semibold">{worker.service}</p>
                        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {worker.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {worker.experience} experience
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{worker.price}</div>
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{worker.rating}</span>
                          <span className="text-muted-foreground">({worker.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-muted-foreground">{worker.bio}</p>
                    
                    <div className="flex gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {worker.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {worker.email}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Certifications */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {worker.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {worker.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="border-primary text-primary">{cert}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Customer Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {worker.reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{review.customer}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "h-4 w-4",
                                i < review.rating 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-2">{review.comment}</p>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Book Appointment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">{worker.price}</div>
                  <p className="text-sm text-muted-foreground">per hour</p>
                </div>
                
                <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Schedule Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Book Appointment with {worker.name}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Date</label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => 
                            date < new Date() || 
                            !availableDates.some(availableDate => 
                              format(availableDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                            )
                          }
                          className={cn("w-full border rounded-md p-3 pointer-events-auto")}
                          modifiers={{
                            available: availableDates,
                          }}
                          modifiersStyles={{
                            available: {
                              backgroundColor: 'hsl(var(--primary) / 0.1)',
                              border: '1px solid hsl(var(--primary) / 0.3)',
                            }
                          }}
                        />
                      </div>
                      
                      {selectedDate && availableTimes.length > 0 && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Select Time</label>
                          <Select value={selectedTime} onValueChange={setSelectedTime}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose time slot" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTimes.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setIsBookingOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={handleBooking}
                          disabled={!selectedDate || !selectedTime}
                        >
                          Confirm Booking
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Available for immediate booking
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Phone className="h-4 w-4" />
                  Call {worker.phone}
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Mail className="h-4 w-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
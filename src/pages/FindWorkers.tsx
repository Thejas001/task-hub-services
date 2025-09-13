import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, ArrowLeft, Loader2, LogIn } from "lucide-react";
import { useApi } from "../hooks/useApi";
import api from "../lib/api";

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

const FindWorkers = () => {
  const navigate = useNavigate();
  const { executeApiCall, isLoading } = useApi();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    };

    checkAuthStatus();
    
    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load service categories from backend
  useEffect(() => {
    const loadServiceCategories = async () => {
      try {
        const response = await api.get('/categories/work-types');
        if (response.data.success) {
          setServiceCategories(response.data.workTypes);
        } else {
          // Fallback to extracting from workers if API fails
          const workersResponse = await api.get('/employee/public');
          const workers = workersResponse.data;
          const categories = [...new Set(workers.map((w: Worker) => w.workType))].filter(Boolean);
          setServiceCategories(categories);
        }
      } catch (error) {
        console.error('Failed to load service categories:', error);
        // Fallback to extracting from workers
        try {
          const workersResponse = await api.get('/employee/public');
          const workers = workersResponse.data;
          const categories = [...new Set(workers.map((w: Worker) => w.workType))].filter(Boolean);
          setServiceCategories(categories);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    };

    loadServiceCategories();
  }, []);

  // Load workers and locations on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all available workers
        const workersResponse = await api.get('/employee/public');
        const workers = workersResponse.data;
        setAvailableWorkers(workers);

        // Extract unique locations
        const locations = [...new Set(workers.map((w: Worker) => w.state).filter(Boolean))];
        setLocations(locations);
      } catch (error) {
        console.error('Failed to load workers:', error);
      }
    };

    loadData();
  }, []);

  // Auto-search when filters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedCategory !== "all" || selectedLocation !== "all" || locationSearch.trim()) {
        searchWorkers();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, selectedLocation, locationSearch]);

  // Search workers using backend API
  const searchWorkers = async () => {
    setIsSearching(true);
    try {
      const searchParams = new URLSearchParams();
      
      if (selectedCategory !== "all") {
        searchParams.append('workType', selectedCategory);
      }
      if (selectedLocation !== "all") {
        searchParams.append('state', selectedLocation);
      }
      if (locationSearch.trim()) {
        searchParams.append('city', locationSearch.trim());
      }
      
      const response = await api.get(`/employee/search?${searchParams.toString()}`);
      setAvailableWorkers(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to local filtering
      performLocalFiltering();
    } finally {
      setIsSearching(false);
    }
  };

  // Local filtering as fallback
  const performLocalFiltering = () => {
    const filtered = availableWorkers.filter(worker => {
      const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                           worker.workType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || worker.workType === selectedCategory;
      const matchesLocation = selectedLocation === "all" || worker.state === selectedLocation;
      const matchesLocationSearch = !locationSearch.trim() || 
                                   worker.city?.toLowerCase().includes(locationSearch.toLowerCase()) ||
                                   worker.state?.toLowerCase().includes(locationSearch.toLowerCase());
      return matchesSearch && matchesCategory && matchesLocation && matchesLocationSearch;
    });
    setAvailableWorkers(filtered);
  };

  // Use local filtering for now (can be enhanced to use backend search)
  const filteredWorkers = availableWorkers.filter(worker => {
    const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         worker.workType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || worker.workType === selectedCategory;
    const matchesLocation = selectedLocation === "all" || worker.state === selectedLocation;
    const matchesLocationSearch = !locationSearch.trim() || 
                                 worker.city?.toLowerCase().includes(locationSearch.toLowerCase()) ||
                                 worker.state?.toLowerCase().includes(locationSearch.toLowerCase());
    return matchesSearch && matchesCategory && matchesLocation && matchesLocationSearch;
  });

  const handleBookWorker = (workerId: number) => {
    if (!isLoggedIn) {
      // Store the current page URL to return after login
      localStorage.setItem('redirectAfterLogin', `/find-workers`);
      // Redirect to login page
      navigate('/');
      return;
    }
    // User is logged in, proceed to booking
    navigate(`/book-worker/${workerId}`);
  };

  const clearFilters = async () => {
    setSearchTerm("");
    setLocationSearch("");
    setSelectedCategory("all");
    setSelectedLocation("all");
    
    // Reload all workers
    try {
      const workersResponse = await api.get('/employee/public');
      setAvailableWorkers(workersResponse.data);
    } catch (error) {
      console.error('Failed to reload workers:', error);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold">Find Workers</h1>
            </div>
            
            {/* Profile/Login Button */}
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/customer-dashboard')}
                  >
                    Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('userRole');
                      localStorage.removeItem('userId');
                      setIsLoggedIn(false);
                      navigate('/');
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/')}
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Login Notice */}
        {!isLoggedIn && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-amber-800">
                <LogIn className="h-5 w-5" />
                <p className="text-sm">
                  <strong>Login required to book services.</strong> Please log in to book a worker or create an account if you don't have one.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search for Service Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Search workers by name or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                <Input
                  placeholder="Search by city or location..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {serviceCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={searchWorkers}
                  disabled={isSearching}
                  className="w-full sm:w-auto"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full sm:w-auto"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results Info */}
        {!isLoading && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''} found
              {(searchTerm || locationSearch || selectedCategory !== "all" || selectedLocation !== "all") && (
                <span className="ml-2 text-primary">
                  (filtered from {availableWorkers.length} total)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Workers Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading workers...</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorkers.map(worker => (
              <Card key={worker.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{worker.firstName} {worker.lastName}</h3>
                        <p className="text-primary font-medium">{worker.workType}</p>
                      </div>
                      <Badge variant={worker.isAvailable ? 'default' : 'secondary'}>
                        {worker.isAvailable ? 'Available' : 'Busy'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{Number(worker.rating || 0).toFixed(1)}</span>
                        <span className="text-xs">({worker.totalReviews || 0})</span>
                        {worker.isVerified && (
                          <Badge variant="outline" className="text-xs ml-1">Verified</Badge>
                        )}
                      </div>
                      {worker.hourlyRate && (
                        <div className="font-semibold text-primary text-lg">₹{Number(worker.hourlyRate).toLocaleString()}/hr</div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      {worker.city ? `${worker.city}, ${worker.state}` : worker.state}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Experience: {worker.workExperience}
                    </div>
                    
                    {worker.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {worker.bio}
                      </p>
                    )}
                    
                    <div className="pt-2">
                      <Button 
                        size="sm"
                        className="w-full"
                        disabled={!worker.isAvailable}
                        onClick={() => handleBookWorker(worker.id)}
                      >
                        {!isLoggedIn ? (
                          <>
                            <LogIn className="w-3 h-3 mr-1" />
                            Login to Book
                          </>
                        ) : (
                          'Book Now'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!isLoading && filteredWorkers.length === 0 && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">No workers found</p>
                <p>Try adjusting your search criteria or filters.</p>
                {availableWorkers.length === 0 && (
                  <p className="text-sm mt-2">No workers are currently available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FindWorkers;
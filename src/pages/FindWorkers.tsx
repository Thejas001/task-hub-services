import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Eye, ArrowLeft } from "lucide-react";

const FindWorkers = () => {
  const navigate = useNavigate();
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

  const filteredWorkers = availableWorkers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || worker.service === selectedCategory;
    const matchesLocation = selectedLocation === "all" || worker.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

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
            <h1 className="text-2xl font-bold">Find Workers</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search for Service Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Search workers by name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40">
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
                  <SelectTrigger className="w-full sm:w-40">
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
          </CardContent>
        </Card>

        {/* Workers Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkers.map(worker => (
            <Card key={worker.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{worker.name}</h3>
                      <p className="text-primary font-medium">{worker.service}</p>
                    </div>
                    <Badge variant={worker.availability === 'Available' ? 'default' : 'secondary'}>
                      {worker.availability}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{worker.rating}</span>
                    </div>
                    <div className="font-semibold text-primary text-lg">{worker.price}</div>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {worker.location}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/worker-profile/${worker.id}`)}
                      className="flex-1 gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View Profile
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1"
                      disabled={worker.availability === 'Busy'}
                      onClick={() => navigate(`/worker-profile/${worker.id}`)}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredWorkers.length === 0 && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">No workers found</p>
                <p>Try adjusting your search criteria or filters.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FindWorkers;
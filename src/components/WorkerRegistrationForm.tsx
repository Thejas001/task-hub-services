import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkerRegistrationProps {
  onSubmit: (data: any) => void;
}

interface FileUpload {
  file: File;
  preview?: string;
  type: string;
}

const WorkerRegistrationForm: React.FC<WorkerRegistrationProps> = ({ onSubmit }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    serviceCategory: '',
    experience: '',
    hourlyRate: '',
    availability: '',
    description: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    idDocument: FileUpload | null;
    experienceDocument: FileUpload | null;
    addressProof: FileUpload | null;
  }>({
    idDocument: null,
    experienceDocument: null,
    addressProof: null
  });

  const serviceCategories = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 
    'Cleaning', 'Gardening', 'Moving', 'Handyman'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (documentType: keyof typeof uploadedFiles, file: File) => {
    const allowedTypes = {
      idDocument: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
      experienceDocument: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
      addressProof: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    };

    if (!allowedTypes[documentType].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload JPG, PNG, or PDF files only.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload files smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    const fileUpload: FileUpload = {
      file,
      type: file.type
    };

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFiles(prev => ({
          ...prev,
          [documentType]: { ...fileUpload, preview: e.target?.result as string }
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedFiles(prev => ({
        ...prev,
        [documentType]: fileUpload
      }));
    }

    toast({
      title: "File uploaded successfully",
      description: `${file.name} has been uploaded.`
    });
  };

  const removeFile = (documentType: keyof typeof uploadedFiles) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentType]: null
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'serviceCategory'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Check if all documents are uploaded
    if (!uploadedFiles.idDocument || !uploadedFiles.experienceDocument || !uploadedFiles.addressProof) {
      toast({
        title: "Missing documents",
        description: "Please upload all required documents.",
        variant: "destructive"
      });
      return;
    }

    const submissionData = {
      ...formData,
      documents: uploadedFiles
    };

    onSubmit(submissionData);
    
    toast({
      title: "Registration submitted!",
      description: "Your worker registration has been submitted for review."
    });
  };

  const FileUploadCard: React.FC<{
    title: string;
    description: string;
    documentType: keyof typeof uploadedFiles;
    acceptedTypes: string;
  }> = ({ title, description, documentType, acceptedTypes }) => (
    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground mt-1">Accepted: {acceptedTypes}</p>
          </div>
          
          {uploadedFiles[documentType] ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                {uploadedFiles[documentType]?.preview ? (
                  <img 
                    src={uploadedFiles[documentType]!.preview} 
                    alt="Preview" 
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <FileText className="w-10 h-10 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadedFiles[documentType]?.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFiles[documentType]?.file.size! / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Uploaded
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(documentType)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(documentType, file);
                }}
                className="hidden"
                id={`file-${documentType}`}
              />
              <Label
                htmlFor={`file-${documentType}`}
                className="cursor-pointer flex flex-col items-center gap-2 p-4 border border-dashed border-muted-foreground/50 rounded-md hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm font-medium">Click to upload</span>
                <span className="text-xs text-muted-foreground">or drag and drop</span>
              </Label>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Worker Registration</CardTitle>
          <CardDescription>
            Complete your profile and upload required documents to join our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Address Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceCategory">Service Category *</Label>
                  <Select onValueChange={(value) => handleInputChange('serviceCategory', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your service category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                    placeholder="e.g., 25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    placeholder="e.g., Mon-Fri, 9AM-5PM"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Service Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your services and expertise..."
                  rows={4}
                />
              </div>
            </div>

            {/* Document Uploads */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Required Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FileUploadCard
                  title="ID Document"
                  description="Government issued ID (Driver's License, Passport, etc.)"
                  documentType="idDocument"
                  acceptedTypes="JPG, PNG, PDF"
                />
                <FileUploadCard
                  title="Experience Document"
                  description="Certificates, portfolio, previous work samples"
                  documentType="experienceDocument"
                  acceptedTypes="JPG, PNG, PDF"
                />
                <FileUploadCard
                  title="Address Proof"
                  description="Utility bill, bank statement, lease agreement"
                  documentType="addressProof"
                  acceptedTypes="JPG, PNG, PDF"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" className="flex-1">
                Submit Registration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerRegistrationForm;
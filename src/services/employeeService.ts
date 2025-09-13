import api from '../lib/api';

export interface EmployeeRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  age: number;
  address: string;
  state: string;
  pinCode: string;
  city?: string;
  nationality: string;
  workExperience: string;
  workType: string;
  hourlyRate?: number;
  bio?: string;
  skills?: string[];
  certifications?: string[];
  isAvailable?: boolean;
  availableDays?: string[];
  availableTimeSlots?: Array<{start: string, end: string}>;
  profilePic?: File;
  certificate?: File;
  aadharCard?: File;
  panCard?: File;
  idCard?: File;
}

export interface EmployeeProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  age: number;
  address: string;
  state: string;
  pinCode: string;
  city?: string;
  nationality: string;
  workExperience: string;
  workType: string;
  hourlyRate?: number;
  bio?: string;
  skills?: string[];
  certifications?: string[];
  isAvailable: boolean;
  availableDays?: string[];
  availableTimeSlots?: Array<{start: string, end: string}>;
  applicationStatus: 'pending' | 'accepted' | 'rejected';
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isBackgroundChecked: boolean;
  profilePic?: string;
  certificate?: string;
  aadharCard?: string;
  panCard?: string;
  idCard?: string;
  createdAt: string;
  updatedAt: string;
}

export const employeeService = {
  // Register as employee/worker
  register: async (data: EmployeeRegistrationData): Promise<{ message: string }> => {
    try {
      const formData = new FormData();
      
      // Add all text fields
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('mobileNumber', data.mobileNumber);
      formData.append('age', data.age.toString());
      formData.append('address', data.address);
      formData.append('state', data.state);
      formData.append('pinCode', data.pinCode);
      if (data.city) formData.append('city', data.city);
      formData.append('nationality', data.nationality);
      formData.append('workExperience', data.workExperience);
      formData.append('workType', data.workType);
      if (data.hourlyRate) formData.append('hourlyRate', data.hourlyRate.toString());
      if (data.bio) formData.append('bio', data.bio);
      if (data.skills) formData.append('skills', JSON.stringify(data.skills));
      if (data.certifications) formData.append('certifications', JSON.stringify(data.certifications));
      if (data.isAvailable !== undefined) formData.append('isAvailable', data.isAvailable.toString());
      if (data.availableDays) formData.append('availableDays', JSON.stringify(data.availableDays));
      if (data.availableTimeSlots) formData.append('availableTimeSlots', JSON.stringify(data.availableTimeSlots));
      
      // Add files if they exist
      if (data.profilePic) {
        formData.append('profilePic', data.profilePic);
      }
      if (data.certificate) {
        formData.append('certificate', data.certificate);
      }
      if (data.aadharCard) {
        formData.append('aadharCard', data.aadharCard);
      }
      if (data.panCard) {
        formData.append('panCard', data.panCard);
      }
      if (data.idCard) {
        formData.append('idCard', data.idCard);
      }
      
      const response = await api.post('/employee/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Get employee profile
  getProfile: async (): Promise<EmployeeProfile> => {
    try {
      const response = await api.get('/employee/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  // Update employee profile
  updateProfile: async (data: Partial<EmployeeRegistrationData>): Promise<{ message: string }> => {
    try {
      const formData = new FormData();
      
      // Add only the fields that are provided
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      const response = await api.put('/employee/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Get work requests for employee
  getWorkRequests: async (): Promise<any[]> => {
    try {
      const response = await api.get('/employee/work-requests');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get work requests');
    }
  },

  // Apply for work request
  applyForWork: async (workRequestId: number): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/employee/apply-work/${workRequestId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to apply for work');
    }
  },

  // Get employee bookings
  getBookings: async (): Promise<any[]> => {
    try {
      const response = await api.get('/employee/bookings');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get bookings');
    }
  },

  // Search workers by criteria
  searchWorkers: async (filters: {
    workType?: string;
    state?: string;
    city?: string;
    minRating?: number;
    isAvailable?: boolean;
    minHourlyRate?: number;
    maxHourlyRate?: number;
  }): Promise<EmployeeProfile[]> => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const response = await api.get(`/employee/search?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search workers');
    }
  },

  // Get worker reviews
  getWorkerReviews: async (workerId: number): Promise<any[]> => {
    try {
      const response = await api.get(`/employee/${workerId}/reviews`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get worker reviews');
    }
  },

  // Add worker review
  addWorkerReview: async (workerId: number, reviewData: {
    rating: number;
    comment?: string;
    bookingId?: number;
  }): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/employee/${workerId}/reviews`, reviewData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add review');
    }
  },

  // Update worker availability
  updateAvailability: async (availabilityData: {
    availableDays?: string[];
    availableTimeSlots?: Array<{start: string, end: string}>;
    isAvailable?: boolean;
  }): Promise<{ message: string }> => {
    try {
      const response = await api.put('/employee/availability', availabilityData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update availability');
    }
  },

  // Get worker portfolio
  getWorkerPortfolio: async (workerId: number): Promise<any[]> => {
    try {
      const response = await api.get(`/employee/${workerId}/portfolio`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get worker portfolio');
    }
  },

  // Add portfolio item
  addPortfolioItem: async (portfolioData: {
    imageUrl: string;
    title?: string;
    description?: string;
    workType?: string;
  }): Promise<{ message: string }> => {
    try {
      const response = await api.post('/employee/portfolio', portfolioData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add portfolio item');
    }
  }
};
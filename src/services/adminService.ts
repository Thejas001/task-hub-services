import api from '../lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeApplication {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  address: string;
  state: string;
  pinCode: string;
  nationality: string;
  workExperience: string;
  workType: string;
  applicationStatus: 'pending' | 'accepted' | 'rejected';
  profilePic?: string;
  certificate?: string;
  aadharCard?: string;
  panCard?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface DashboardStats {
  totalUsers: number;
  activeWorkers: number;
  totalBookings: number;
  pendingApprovals: number;
}

export const adminService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users/all');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get users');
    }
  },

  // Get pending employee applications
  getPendingEmployeeApplications: async (): Promise<EmployeeApplication[]> => {
    try {
      const response = await api.get('/employee/pending-applications');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get pending applications');
    }
  },

  // Get all employees
  getAllEmployees: async (): Promise<EmployeeApplication[]> => {
    try {
      const response = await api.get('/employee');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get employees');
    }
  },

  // Approve employee application
  approveEmployee: async (employeeId: number): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/employee/${employeeId}/approve`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve employee');
    }
  },

  // Reject employee application
  rejectEmployee: async (employeeId: number): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/employee/${employeeId}/reject`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject employee');
    }
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      // Since we don't have a dedicated stats endpoint, we'll calculate from existing data
      const [users, employees, bookings] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllEmployees(),
        bookingService.getAllBookings()
      ]);

      const activeWorkers = employees.filter(emp => emp.applicationStatus === 'accepted').length;
      const pendingApprovals = employees.filter(emp => emp.applicationStatus === 'pending').length;

      return {
        totalUsers: users.length,
        activeWorkers,
        totalBookings: bookings.length,
        pendingApprovals
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get dashboard stats');
    }
  },

  // Update user
  updateUser: async (userId: number, data: Partial<User>): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  // Delete user
  deleteUser: async (userId: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  // Create worker (admin only)
  createWorker: async (workerData: any): Promise<{ message: string; worker: any }> => {
    try {
      const response = await api.post('/admin/create-worker', workerData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create worker');
    }
  }
};

// Import bookingService for stats calculation
import { bookingService } from './bookingService';



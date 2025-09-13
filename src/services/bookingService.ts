import api from '../lib/api';

export interface BookingData {
  employeeId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  workDescription: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  estimatedHours: number;
  specialRequirements?: string;
}

export interface Booking {
  id: number;
  employeeId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  workDescription: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  estimatedHours: number;
  specialRequirements?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    workType: string;
  };
}

export const bookingService = {
  // Create new booking
  createBooking: async (data: BookingData): Promise<{ message: string; booking?: Booking }> => {
    try {
      const response = await api.post('/bookings', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  },

  // Get bookings for current user (customer)
  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get('/bookings/my-bookings');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get bookings');
    }
  },

  // Get bookings for employee
  getEmployeeBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get('/bookings/worker/my-bookings');
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get employee bookings');
    }
  },

  // Get all bookings (admin only)
  getAllBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get('/bookings');
      // Backend returns { success, data } shape
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get all bookings');
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId: number, status: 'accepted' | 'rejected' | 'completed'): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update booking status');
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId: number): Promise<Booking> => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get booking');
    }
  }
};

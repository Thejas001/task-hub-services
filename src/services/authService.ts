import api from '../lib/api';

export interface LoginData {
  email: string;
  password: string;
  role: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  phoneNumber?: string;
  address?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  // Login user - routes to correct endpoint based on role
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      let endpoint = '/users/login'; // default for customers
      
      // Route to correct endpoint based on role
      if (data.role === 'admin') {
        endpoint = '/admin/login';
      } else if (data.role === 'worker') {
        endpoint = '/employee/login';
      }
      
      const response = await api.post(endpoint, {
        email: data.email,
        password: data.password
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Register user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/users/register', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  }
};

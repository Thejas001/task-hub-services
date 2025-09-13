import api from '../lib/api';

export interface JobPost {
  id: number;
  userId: number;
  employeeId: number;
  category: string;
  description: string;
  ratePerHour?: number;
  ratePerDay?: number;
  location: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export const jobPostService = {
  create: async (data: {
    category: string;
    description: string;
    ratePerHour?: number;
    ratePerDay?: number;
    location: string;
  }): Promise<{ message: string; jobPost: JobPost }> => {
    const res = await api.post('/jobposts/create', data);
    return res.data;
  },

  getMyPosts: async (): Promise<{ message: string; count: number; jobPosts: JobPost[] }> => {
    const res = await api.get('/jobposts/my-posts');
    return res.data;
  },

  getAllPosts: async (filters?: {
    category?: string;
    status?: string;
    location?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ message: string; count: number; jobPosts: JobPost[] }> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const queryString = params.toString();
    const url = queryString ? `/jobposts/all?${queryString}` : '/jobposts/all';
    const res = await api.get(url);
    return res.data;
  }
};







import api from '../lib/api';

export interface ServiceCategory {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  activeWorkers?: number;
}

export const categoryService = {
  list: async (): Promise<ServiceCategory[]> => {
    const res = await api.get('/categories');
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  },
  create: async (payload: { title: string; description?: string; icon?: string; color?: string; }): Promise<ServiceCategory> => {
    const res = await api.post('/categories', payload);
    return res.data?.data || res.data;
  },

  getWorkTypes: async (): Promise<{ success: boolean; workTypes: string[] }> => {
    const res = await api.get('/categories/work-types');
    return res.data;
  }
};



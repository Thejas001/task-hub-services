import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const executeApiCall = async <T>(
    apiCall: () => Promise<T>,
    options?: {
      showLoading?: boolean;
      onSuccess?: (data: T) => void;
      onError?: (error: string) => void;
      redirectOnAuthError?: boolean;
    }
  ): Promise<T | null> => {
    const {
      showLoading = true,
      onSuccess,
      onError,
      redirectOnAuthError = true
    } = options || {};

    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);

      // Handle authentication errors
      if (err.response?.status === 401 && redirectOnAuthError) {
        localStorage.clear();
        navigate('/');
      }

      return null;
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    executeApiCall,
    clearError: () => setError(null)
  };
};





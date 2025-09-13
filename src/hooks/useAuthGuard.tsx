import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type GuardResult = {
  isReady: boolean;
};

export function useAuthGuard(): GuardResult {
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const enforce = async () => {
      const token = localStorage.getItem('authToken');
      const role = (localStorage.getItem('userRole') || '').toLowerCase();

      // Only guard worker flows
      if (!token || role !== 'employee') {
        setIsReady(true);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/employee/status', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 404) {
          // No application yet → force to complete profile
          if (location.pathname !== '/worker-complete-profile') {
            navigate('/worker-complete-profile', { replace: true });
          }
          setIsReady(true);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          const status = (data.applicationStatus || '').toLowerCase();

          if (status !== 'accepted') {
            // Pending or rejected → force to dashboard (restricted UI there)
            if (location.pathname !== '/worker-dashboard') {
              navigate('/worker-dashboard', { replace: true });
            }
          }
        }
      } catch {}

      setIsReady(true);
    };

    enforce();
  }, [location.pathname, navigate]);

  return { isReady };
}



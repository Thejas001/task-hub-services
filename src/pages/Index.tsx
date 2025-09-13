
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Hero from "../components/Hero";
import ServiceCategories from "../components/ServiceCategories";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  const handleAuthSuccess = (role: string, needsProfileCompletion?: boolean) => {
    setIsAuthModalOpen(false);
    // Store user session in localStorage
    localStorage.setItem('userRole', role);
    
    // Check if there's a redirect URL stored
    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectUrl);
      return;
    }
    
    // Navigate to appropriate dashboard based on backend role values
    switch(role.toLowerCase()) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'employee':
        if (needsProfileCompletion) {
          navigate('/worker-complete-profile');
        } else {
          navigate('/worker-application-status');
        }
        break;
      case 'user':
        navigate('/customer-dashboard');
        break;
      default:
        // Fallback for any other roles
        navigate('/customer-dashboard');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        onLoginClick={() => {
          setAuthMode('login');
          setIsAuthModalOpen(true);
        }}
        onRegisterClick={() => {
          setAuthMode('register');
          setIsAuthModalOpen(true);
        }}
      />
      <Hero 
        onGetStartedClick={() => {
          setAuthMode('register');
          setIsAuthModalOpen(true);
        }}
      />
      <ServiceCategories />
      <HowItWorks />
      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;

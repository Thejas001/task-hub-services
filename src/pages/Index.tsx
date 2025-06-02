
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

  const handleAuthSuccess = (role: string) => {
    setIsAuthModalOpen(false);
    // Store user session in localStorage
    localStorage.setItem('userRole', role);
    
    // Navigate to appropriate dashboard
    switch(role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'worker':
        navigate('/worker-dashboard');
        break;
      case 'customer':
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import WorkerRegistrationForm from '../components/WorkerRegistrationForm';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { employeeService } from '../services/employeeService';
import { useToast } from '@/hooks/use-toast';

const WorkerRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegistrationSubmit = async (data: any) => {
    try {
      const response = await employeeService.register(data);
      
      if (response.message) {
        toast({
          title: "Registration submitted!",
          description: "Your worker registration has been submitted for review.",
        });
        
        // Store temporary data and redirect to dashboard
        localStorage.setItem('userRole', 'worker');
        localStorage.setItem('workerStatus', 'pending');
        
        navigate('/worker-dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        onLoginClick={() => navigate('/')}
        onRegisterClick={() => navigate('/')}
      />
      <main className="pt-20 pb-12">
        <WorkerRegistrationForm onSubmit={handleRegistrationSubmit} />
      </main>
      <Footer />
    </div>
  );
};

export default WorkerRegistration;
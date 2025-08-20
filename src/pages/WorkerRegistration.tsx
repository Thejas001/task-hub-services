import React from 'react';
import { useNavigate } from 'react-router-dom';
import WorkerRegistrationForm from '../components/WorkerRegistrationForm';
import Header from '../components/Header';
import Footer from '../components/Footer';

const WorkerRegistration = () => {
  const navigate = useNavigate();

  const handleRegistrationSubmit = (data: any) => {
    console.log('Worker registration data:', data);
    
    // In a real app, you would send this data to your backend
    // For now, we'll simulate successful registration
    
    // Store temporary data and redirect to dashboard
    localStorage.setItem('userRole', 'worker');
    localStorage.setItem('workerStatus', 'pending');
    
    navigate('/worker-dashboard');
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
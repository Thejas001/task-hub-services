
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onAuthSuccess: (role: string, needsProfileCompletion?: boolean) => void;
}

const AuthModal = ({ isOpen, onClose, mode, onModeChange, onAuthSuccess }: AuthModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Form submitted!', { mode, formData });
    alert(`Form submitted! Mode: ${mode}, Role: ${formData.role}, Email: ${formData.email}`);
    
    try {
      if (mode === 'login') {
        // Handle login
        const baseUrl = 'http://localhost:5000/api';
        let endpoint = `${baseUrl}/users/login`; // default for customers

        // Route to correct endpoint based on selected role
        if (formData.role === 'admin') {
          endpoint = `${baseUrl}/admin/login`;
        } else if (formData.role === 'worker') {
          endpoint = `${baseUrl}/employee/login`;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('userId', data.user.id);
          
          // Decide post-login navigation for workers based on application status
          if ((data.user.role || '').toLowerCase() === 'employee' || formData.role === 'worker') {
            try {
              const statusRes = await fetch('http://localhost:5000/api/employee/status', {
                headers: { Authorization: `Bearer ${data.token}` }
              });
              if (statusRes.ok) {
                const st = await statusRes.json();
                // go to worker dashboard; dashboard shows status banner
                window.location.href = '/worker-dashboard';
              } else if (statusRes.status === 404) {
                // no application yet → complete profile
                window.location.href = '/worker-complete-profile';
              } else {
                window.location.href = '/worker-dashboard';
              }
            } catch {
              window.location.href = '/worker-dashboard';
            }
          } else if ((data.user.role || '').toLowerCase() === 'admin' || formData.role === 'admin') {
            // Navigate admins to admin dashboard
            window.location.href = '/admin-dashboard';
          } else {
            // Navigate customers to find-workers page
            window.location.href = '/find-workers';
          }
        } else {
          alert(data.message || 'Login failed');
        }
      } else {
        // Handle registration
        if (formData.role === 'worker') {
          // Create worker account directly, then go to complete profile
          try {
            console.log('🚀 Attempting worker registration with:', { email: formData.email });
            const resp = await fetch('http://localhost:5000/api/users/register-worker', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            console.log('📡 Response status:', resp.status);
            const data = await resp.json();
            console.log('📦 Response data:', data);
            if (resp.ok) {
              console.log('✅ Registration successful, storing token:', data.token);
              localStorage.setItem('authToken', data.token);
              localStorage.setItem('userRole', data.user.role);
              localStorage.setItem('userId', data.user.id);
              onClose();
              window.location.href = '/worker-complete-profile';
              return;
            } else {
              console.error('❌ Registration failed:', data);
              alert(data.message || 'Worker registration failed');
              return;
            }
          } catch (e) {
            console.error('💥 Network error:', e);
            alert('Network error. Please try again.');
            return;
          }
        } else {
          // Handle customer registration
          const response = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              phone: ''
            }),
          });

          const data = await response.json();
          
          if (response.ok) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userId', data.user.id);
            
            onAuthSuccess(data.user.role);
          } else {
            alert(data.message || 'Registration failed');
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Network error. Please try again.');
    }
    
    // Reset form
    setFormData({
      email: '',
      password: '',
      role: 'customer'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={mode} onValueChange={(value) => onModeChange(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="role">Login as</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="role">Register as</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;

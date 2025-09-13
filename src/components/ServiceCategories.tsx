
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from 'react';

const ServiceCategories = () => {
  const [services, setServices] = useState<{ title: string; description?: string; icon?: string; color?: string; }[]>([]);

  useEffect(() => {
    // Always show the full list of service categories
    setServices([
      { title: 'Plumbing', description: 'Professional plumbers for all your water and pipe related needs', icon: '🔧', color: 'bg-blue-100 text-blue-800' },
      { title: 'Electrical', description: 'Certified electricians for installations and repairs', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
      { title: 'Gardening', description: 'Expert gardeners to maintain and beautify your outdoor spaces', icon: '🌱', color: 'bg-green-100 text-green-800' },
      { title: 'Cleaning', description: 'Professional cleaning services for homes and offices', icon: '🧽', color: 'bg-purple-100 text-purple-800' },
      { title: 'Painting', description: 'Professional painters for interior and exterior painting', icon: '🎨', color: 'bg-pink-100 text-pink-800' },
      { title: 'Carpentry', description: 'Skilled carpenters for furniture and woodwork', icon: '🔨', color: 'bg-orange-100 text-orange-800' },
      { title: 'Landscaping', description: 'Landscape designers for beautiful outdoor spaces', icon: '🌿', color: 'bg-emerald-100 text-emerald-800' },
      { title: 'HVAC', description: 'Heating, ventilation, and air conditioning specialists', icon: '❄️', color: 'bg-cyan-100 text-cyan-800' }
    ]);
  }, []);


  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Service Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from our wide range of professional services
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${service.color} mx-auto mb-4 text-2xl`}>
                  {service.icon}
                </div>
                <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ServiceCategories;

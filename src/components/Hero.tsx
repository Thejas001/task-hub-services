
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  onGetStartedClick?: () => void;
}

const Hero = ({ onGetStartedClick }: HeroProps) => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/find-workers');
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Find Skilled Workers for
          <span className="text-blue-600"> Any Task</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect with verified professionals for plumbing, electrical work, gardening, cleaning, and more. 
          Quality service at your doorstep.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={handleGetStarted}>
            Browse Workers
          </Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

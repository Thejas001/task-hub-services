
const HowItWorks = () => {
  const steps = [
    {
      step: "1",
      title: "Choose Service",
      description: "Select the type of service you need from our categories"
    },
    {
      step: "2",
      title: "Find Worker",
      description: "Browse verified workers in your area and check their ratings"
    },
    {
      step: "3", 
      title: "Book & Pay",
      description: "Schedule your service and make secure payment"
    },
    {
      step: "4",
      title: "Get Job Done",
      description: "Enjoy quality service and rate your experience"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Getting professional help has never been easier
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-xl font-bold mb-4">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import FindWorkers from "./pages/FindWorkers";
import BookWorker from "./pages/BookWorker";
import WorkerRegistration from "./pages/WorkerRegistration";
import WorkerProfile from "./pages/WorkerProfile";
import WorkerApplicationStatus from "./pages/WorkerApplicationStatus";
import NotFound from "./pages/NotFound";
import WorkerBasicRegistration from "./components/WorkerBasicRegistration";
import WorkerCompleteProfile from "./components/WorkerCompleteProfile";
import { useAuthGuard } from "./hooks/useAuthGuard";

const queryClient = new QueryClient();

const GuardedRoutes = () => {
  // Execute guard on route changes
  useAuthGuard();
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/worker-dashboard" element={<WorkerDashboard />} />
      <Route path="/customer-dashboard" element={<CustomerDashboard />} />
      <Route path="/find-workers" element={<FindWorkers />} />
      <Route path="/book-worker/:workerId" element={<BookWorker />} />
      <Route path="/worker-registration" element={<WorkerRegistration />} />
      <Route path="/worker-basic-registration" element={<WorkerBasicRegistration />} />
      <Route path="/worker-complete-profile" element={<WorkerCompleteProfile />} />
      <Route path="/worker-application-status" element={<WorkerApplicationStatus />} />
      <Route path="/worker-profile/:workerId" element={<WorkerProfile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GuardedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

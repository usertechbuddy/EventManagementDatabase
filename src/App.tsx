import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import EventScheduling from "./components/EventScheduling";
import VendorManagement from "./components/VendorManagement";
import ClientManagement from "./components/ClientManagement";
import BudgetModule from "./components/BudgetModule";
import ReportingDashboard from "./components/ReportingDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Consider using only one toaster unless needed */}
      <Toaster />
      <Sonner />
      <BrowserRouter>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/home" element={<Index />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/schedule" element={<EventScheduling />} />
    <Route path="/vendors" element={<VendorManagement />} />
    <Route path="/clients" element={<ClientManagement />} />
    <Route path="/budget" element={<BudgetModule />} />
    <Route path="/reports" element={<ReportingDashboard />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

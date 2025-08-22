import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Users,
  Calendar,
  User,
  DollarSign,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ClientManagement from '@/components/ClientManagement';
import EventScheduling from '@/components/EventScheduling';
import VendorManagement from '@/components/VendorManagement';
import BudgetModule from '@/components/BudgetModule';
import ReportingDashboard from '@/components/ReportingDashboard';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    upcomingEvents: 0,
    activeVendors: 0,
    totalBudget: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [clientsData, eventsData, vendorsData, budgetsData] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('events').select('*'),
        supabase.from('vendors').select('*'),
        supabase.from('budgets').select('*')
      ]);

      const clients = clientsData.data || [];
      const events = eventsData.data || [];
      const vendors = vendorsData.data || [];
      const budgets = budgetsData.data || [];

      const now = new Date();
      const upcomingEvents = events.filter(event => new Date(event.date) > now);
      const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.total_budget || 0), 0);

      setStats({
        totalClients: clients.length,
        upcomingEvents: upcomingEvents.length,
        activeVendors: vendors.length,
        totalBudget
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Error",
        description: "Failed to load statistics.",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account."
      });
      navigate('/auth');
    } catch {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-yellow-400"></div>
        <p className="mt-4 text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Sparkly glowing background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-30%] left-[10%] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-30 filter blur-3xl animate-blob glow-purple"></div>
        <div className="absolute top-[20%] right-[15%] w-[500px] h-[500px] bg-indigo-600 rounded-full opacity-25 filter blur-3xl animate-blob animation-delay-2000 glow-indigo"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[350px] h-[350px] bg-cyan-600 rounded-full opacity-20 filter blur-3xl animate-blob animation-delay-4000 glow-cyan"></div>
      </div>

      <div className="container mx-auto px-6 py-10 relative z-10">
        {/* Header with Sign Out */}
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg glow-text">Event Management System</h1>
            <p className="text-gray-300 mt-1 text-lg">Welcome back, <span className="font-semibold">{user.email}</span>!</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2 border-gray-500 hover:border-gray-400 text-gray-300 hover:text-white transition glow-button"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {[
            {
              title: 'Total Clients',
              value: stats.totalClients,
              icon: <Users className="h-6 w-6 text-blue-400" />,
              bg: 'bg-gradient-to-r from-blue-700 to-blue-500 glow-card'
            },
            {
              title: 'Upcoming Events',
              value: stats.upcomingEvents,
              icon: <Calendar className="h-6 w-6 text-green-400" />,
              bg: 'bg-gradient-to-r from-green-700 to-green-500 glow-card'
            },
            {
              title: 'Active Vendors',
              value: stats.activeVendors,
              icon: <User className="h-6 w-6 text-purple-400" />,
              bg: 'bg-gradient-to-r from-purple-700 to-purple-500 glow-card'
            },
            {
              title: 'Total Budget',
              value: `$${stats.totalBudget.toLocaleString()}`,
              icon: <DollarSign className="h-6 w-6 text-yellow-400" />,
              bg: 'bg-gradient-to-r from-yellow-700 to-yellow-500 glow-card'
            }
          ].map(({ title, value, icon, bg }) => (
            <Card key={title} className={`${bg} text-white shadow-lg rounded-lg`}>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                {icon}
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-extrabold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-gray-900 bg-opacity-60 backdrop-blur-lg shadow-2xl rounded-xl border border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white text-xl font-bold glow-text">
              <BarChart3 className="h-6 w-6 text-cyan-400" />
              Event Management Dashboard
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage clients, events, vendors, budgets, and reports all in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-6 rounded-lg bg-gray-800 border border-gray-700">
                <TabsTrigger value="dashboard" className="hover:bg-cyan-600 hover:text-white focus:bg-cyan-700 focus:text-white glow-tab">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="clients" className="hover:bg-cyan-600 hover:text-white focus:bg-cyan-700 focus:text-white glow-tab">
                  Clients
                </TabsTrigger>
                <TabsTrigger value="events" className="hover:bg-cyan-600 hover:text-white focus:bg-cyan-700 focus:text-white glow-tab">
                  Events
                </TabsTrigger>
                <TabsTrigger value="vendors" className="hover:bg-cyan-600 hover:text-white focus:bg-cyan-700 focus:text-white glow-tab">
                  Vendors
                </TabsTrigger>
                <TabsTrigger value="budget" className="hover:bg-cyan-600 hover:text-white focus:bg-cyan-700 focus:text-white glow-tab">
                  Budget
                </TabsTrigger>
                <TabsTrigger value="reports" className="hover:bg-cyan-600 hover:text-white focus:bg-cyan-700 focus:text-white glow-tab">
                  Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-8">
                <ReportingDashboard />
              </TabsContent>

              <TabsContent value="clients" className="mt-8">
                <ClientManagement />
              </TabsContent>

              <TabsContent value="events" className="mt-8">
                <EventScheduling />
              </TabsContent>

              <TabsContent value="vendors" className="mt-8">
                <VendorManagement />
              </TabsContent>

              <TabsContent value="budget" className="mt-8">
                <BudgetModule />
              </TabsContent>

              <TabsContent value="reports" className="mt-8">
                <ReportingDashboard />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Custom animations and glow styles */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .glow-purple {
          box-shadow: 0 0 30px 10px rgba(139, 92, 246, 0.6);
        }
        .glow-indigo {
          box-shadow: 0 0 40px 15px rgba(99, 102, 241, 0.5);
        }
        .glow-cyan {
          box-shadow: 0 0 35px 12px rgba(6, 182, 212, 0.6);
        }
        .glow-text {
          text-shadow:
            0 0 5px #06b6d4,
            0 0 10px #06b6d4,
            0 0 20px #06b6d4,
            0 0 40px #22d3ee;
        }
        .glow-button:hover {
          box-shadow: 0 0 15px 3px rgba(132, 204, 22, 0.7);
        }
        .glow-card {
          box-shadow:
            0 0 15px 3px rgba(59, 130, 246, 0.7),
            0 0 30px 5px rgba(59, 130, 246, 0.5);
          transition: box-shadow 0.3s ease-in-out;
        }
        .glow-card:hover {
          box-shadow:
            0 0 25px 5px rgba(59, 130, 246, 0.9),
            0 0 40px 10px rgba(59, 130, 246, 0.7);
        }
        .glow-tab:hover, .glow-tab:focus {
          box-shadow: 0 0 10px 3px rgba(6, 182, 212, 0.8);
          border-radius: 0.5rem;
          transition: box-shadow 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Index;

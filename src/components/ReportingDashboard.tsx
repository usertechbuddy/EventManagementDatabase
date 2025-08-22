import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Calendar,
  Users,
  User,
  DollarSign,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// --- Helper component for the background effect ---
const SparkleBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="sparkle"></div>
    <div className="sparkle"></div>
    <div className="sparkle"></div>
    <div className="sparkle"></div>
    <div className="sparkle"></div>
    <div className="sparkle"></div>
    <div className="sparkle"></div>
    <div className="sparkle"></div>
  </div>
);

// --- Interfaces and Constants (Unchanged) ---
interface DashboardStats {
  totalClients: number;
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalVendors: number;
  totalBudget: number;
  totalExpenses: number;
  topClients: Array<{ name: string; eventCount: number }>;
  topVendors: Array<{ name: string; category: string }>;
  monthlyExpenses: Array<{ month: string; amount: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];


// --- Main Dashboard Component ---
const ReportingDashboard = () => {
  // --- All your state and data fetching logic is UNCHANGED ---
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    totalVendors: 0,
    totalBudget: 0,
    totalExpenses: 0,
    topClients: [],
    topVendors: [],
    monthlyExpenses: [],
    expensesByCategory: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      calculateStats();
    }
  }, [user]);

  const calculateStats = async () => {
    try {
      setLoading(true);
      const [
        { data: clients = [], error: clientsError },
        { data: events = [], error: eventsError },
        { data: vendors = [], error: vendorsError },
        { data: budgets = [], error: budgetsError },
        { data: expenses = [], error: expensesError }
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('events').select('*'),
        supabase.from('vendors').select('*'),
        supabase.from('budgets').select('*'),
        supabase.from('expenses').select('*')
      ]);

      if (clientsError || eventsError || vendorsError || budgetsError || expensesError) {
        throw new Error('Failed to fetch data');
      }

      // --- All data processing logic is UNCHANGED ---
      const now = new Date();
      const upcomingEvents = events.filter((event: any) => new Date(event.date) > now);
      const completedEvents = events.filter((event: any) => event.status === 'completed');
      const clientEventCounts = clients.map((client: any) => ({ name: client.name, eventCount: events.filter((event: any) => event.client_id === client.id).length })).sort((a, b) => b.eventCount - a.eventCount).slice(0, 5);
      const topVendors = vendors.filter((vendor: any) => vendor.availability === 'available').slice(0, 5).map((vendor: any) => ({ name: vendor.name, category: vendor.service_category }));
      const monthlyExpenseMap = new Map<string, { month: string; amount: number }>();
      expenses.forEach((expense: any) => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (!monthlyExpenseMap.has(monthKey)) { monthlyExpenseMap.set(monthKey, { month: monthName, amount: 0 }); }
        monthlyExpenseMap.get(monthKey)!.amount += Number(expense.amount);
      });
      const monthlyExpenses = Array.from(monthlyExpenseMap.values()).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
      const categoryExpenseMap = new Map<string, number>();
      expenses.forEach((expense: any) => {
        if (!categoryExpenseMap.has(expense.category)) { categoryExpenseMap.set(expense.category, 0); }
        categoryExpenseMap.set(expense.category, categoryExpenseMap.get(expense.category)! + Number(expense.amount));
      });
      const expensesByCategory = Array.from(categoryExpenseMap.entries()).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
      const totalBudget = budgets.reduce((sum: number, budget: any) => sum + Number(budget.total_budget || 0), 0);
      const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + Number(expense.amount || 0), 0);

      setStats({
        totalClients: clients.length, totalEvents: events.length, upcomingEvents: upcomingEvents.length, completedEvents: completedEvents.length, totalVendors: vendors.length, totalBudget, totalExpenses, topClients: clientEventCounts, topVendors, monthlyExpenses, expensesByCategory
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
      toast({ title: 'Error', description: 'Failed to load dashboard data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // --- Updated Loading and Auth States to match the dark theme ---
  const LoadingOrAuthPrompt = ({ message }: { message: string }) => (
    <div className="relative flex h-[50vh] w-full items-center justify-center rounded-lg bg-gray-900/50 p-8 text-center text-xl text-gray-300 backdrop-blur-md">
      <SparkleBackground />
      <p>{message}</p>
    </div>
  );

  if (!user) {
    return <LoadingOrAuthPrompt message="Please sign in to view the dashboard." />;
  }

  if (loading) {
    return <LoadingOrAuthPrompt message="Conjuring magical insights..." />;
  }

  // --- Main UI with new CSS classes for styling ---
  return (
    <div className="reporting-dashboard-container relative space-y-8">
      <SparkleBackground />

      {/* --- The CSS for all the new effects --- */}
      <style>{`
        /* --- Base & Background --- */
        .reporting-dashboard-container h2,
        .reporting-dashboard-container h3,
        .reporting-dashboard-container .card-title-glow {
          text-shadow: 0 0 8px rgba(200, 225, 255, 0.4);
        }
        
        @keyframes sparkle-anim {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          50% { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
        }
        .sparkle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 10px 2px white, 0 0 20px 5px #a7c2ff;
          animation: sparkle-anim 3s infinite;
        }
        .sparkle:nth-child(1) { top: 10%; left: 15%; animation-duration: 2.5s; animation-delay: 0.5s; }
        .sparkle:nth-child(2) { top: 30%; left: 80%; animation-duration: 3s; }
        .sparkle:nth-child(3) { top: 85%; left: 50%; animation-duration: 2s; animation-delay: 1s; }
        .sparkle:nth-child(4) { top: 60%; left: 5%; animation-duration: 4s; }
        .sparkle:nth-child(5) { top: 5%; left: 95%; animation-duration: 2.8s; animation-delay: 0.2s; }
        .sparkle:nth-child(6) { top: 40%; left: 40%; animation-duration: 3.5s; animation-delay: 1.5s; }
        .sparkle:nth-child(7) { top: 90%; left: 20%; animation-duration: 2.2s; }
        .sparkle:nth-child(8) { top: 70%; left: 90%; animation-duration: 3.2s; animation-delay: 0.8s; }

        /* --- Custom Card Styling --- */
        .glow-card {
          background-color: rgba(17, 24, 39, 0.5); /* bg-gray-900/50 */
          backdrop-filter: blur(12px);
          border: 1px solid rgba(55, 65, 81, 0.4); /* border-gray-700/40 */
          transition: all 0.3s ease;
        }
        .glow-card:hover {
          border-color: rgba(6, 182, 212, 0.5); /* border-cyan-500/50 */
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
        }
        .glow-card .recharts-wrapper {
          filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5));
        }
        .recharts-text.recharts-label {
          fill: #d1d5db; /* gray-300 */
        }
        .recharts-cartesian-axis-tick-value {
          fill: #9ca3af; /* gray-400 */
        }
        
        /* --- Key Metric Card Enhancements --- */
        .metric-card-glow {
          transition: all 0.3s ease;
          position: relative;
        }
        .metric-card-glow:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
      `}</style>

      <div>
        <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
        <p className="text-gray-300 mt-1">Your event management insights at a glance</p>
      </div>

      {/* --- Key Metrics --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white metric-card-glow" style={{boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Events</CardTitle><Calendar className="h-4 w-4" /></CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.totalEvents}</div><p className="text-xs text-blue-200">{stats.upcomingEvents} upcoming</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-600 to-green-800 text-white metric-card-glow" style={{boxShadow: '0 0 15px rgba(34, 197, 94, 0.5)'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Clients</CardTitle><Users className="h-4 w-4" /></CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.totalClients}</div><p className="text-xs text-green-200">Active clients</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-600 to-purple-800 text-white metric-card-glow" style={{boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Vendors</CardTitle><User className="h-4 w-4" /></CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.totalVendors}</div><p className="text-xs text-purple-200">Service providers</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-700 text-white metric-card-glow" style={{boxShadow: '0 0 15px rgba(249, 115, 22, 0.5)'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Budget vs Spent</CardTitle><DollarSign className="h-4 w-4" /></CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.totalBudget > 0 ? `${((stats.totalExpenses / stats.totalBudget) * 100).toFixed(1)}%` : '0%'}</div><p className="text-xs text-orange-200">${stats.totalExpenses.toLocaleString()} spent</p></CardContent>
        </Card>
      </div>
      
      {/* --- Charts Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glow-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white card-title-glow"><TrendingUp className="h-5 w-5 text-cyan-400" />Monthly Expenses</CardTitle><CardDescription className="text-gray-400">Expense trends over the last 6 months</CardDescription></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={stats.monthlyExpenses}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" /><XAxis dataKey="month" /><YAxis /><Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }} formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} /><Bar dataKey="amount" fill="#3B82F6" /></BarChart></ResponsiveContainer></CardContent>
        </Card>
        <Card className="glow-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white card-title-glow"><Award className="h-5 w-5 text-cyan-400" />Expenses by Category</CardTitle><CardDescription className="text-gray-400">Breakdown of expenses across categories</CardDescription></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={stats.expensesByCategory} cx="50%" cy="50%" labelLine={false} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`} outerRadius={90} fill="#8884d8" dataKey="amount">{stats.expensesByCategory.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }} formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} /></PieChart></ResponsiveContainer></CardContent>
        </Card>
      </div>

      {/* --- Top Lists & Status Overview Sections (with updated styling) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glow-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white card-title-glow"><Users className="h-5 w-5 text-cyan-400" />Top 5 Clients</CardTitle><CardDescription className="text-gray-400">Clients with most events</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topClients.length > 0 ? (stats.topClients.map((client, index) => (<div key={index} className="flex items-center justify-between"><div className="flex items-center space-x-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'}`}>{index + 1}</div><span className="font-medium text-gray-200">{client.name}</span></div><span className="text-sm text-gray-400">{client.eventCount} events</span></div>))) : (<p className="text-gray-500 text-center py-4">No client data available</p>)}
            </div>
          </CardContent>
        </Card>
        <Card className="glow-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-white card-title-glow"><Award className="h-5 w-5 text-cyan-400" />Available Vendors</CardTitle><CardDescription className="text-gray-400">Top vendors ready for your events</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topVendors.length > 0 ? (stats.topVendors.map((vendor, index) => (<div key={index} className="flex items-center justify-between"><div className="flex items-center space-x-3"><div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">{vendor.name.charAt(0)}</div><span className="font-medium text-gray-200">{vendor.name}</span></div><span className="text-sm text-gray-800 bg-gray-300 px-2 py-1 rounded">{vendor.category}</span></div>))) : (<p className="text-gray-500 text-center py-4">No vendor data available</p>)}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="glow-card">
        <CardHeader><CardTitle className="flex items-center gap-2 text-white card-title-glow"><Clock className="h-5 w-5 text-cyan-400" />Event Status Overview</CardTitle><CardDescription className="text-gray-400">Current status of all your events</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><div className="text-3xl font-bold text-blue-400">{stats.upcomingEvents}</div><div className="text-sm text-gray-400">Upcoming</div></div>
            <div><div className="text-3xl font-bold text-green-400">{stats.completedEvents}</div><div className="text-sm text-gray-400">Completed</div></div>
            <div><div className="text-3xl font-bold text-gray-300">{stats.totalBudget > 0 ? `$${stats.totalBudget.toLocaleString()}` : '$0'}</div><div className="text-sm text-gray-400">Total Budget</div></div>
            <div><div className="text-3xl font-bold text-orange-400">${stats.totalExpenses.toLocaleString()}</div><div className="text-sm text-gray-400">Total Expenses</div></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportingDashboard;
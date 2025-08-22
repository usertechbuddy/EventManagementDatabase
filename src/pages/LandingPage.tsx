import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, 
  Users, 
  Building2, 
  UserCheck, 
  Settings 
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role: 'user' | 'worker') => {
    navigate(`/auth?role=${role}`);
  };

  return (
    <div 
      className="relative -m-8 min-h-screen p-8 bg-fixed"
      style={{ 
        background: 'linear-gradient(135deg, rgba(29,78,216,0.9) 0%, rgba(219,39,119,0.9) 100%)',
      }}
    >
      {/* Glowy overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-pink-500/20 opacity-60 z-0" />
      
      {/* Semi-transparent dark overlay */}
      <div className="absolute inset-0 bg-gray-900/80 z-0" />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 
            className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500 backdrop-blur-sm"
            style={{
            textShadow: '0 2px 4px rgba(219, 39, 119, 0.3)',
            filter: 'drop-shadow(0 2px 2px rgba(124, 58, 237, 0.2))',
                   }}
            >
            MemoriaApex Event Hub
            </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
           Welcome to MemoriaApex Event Hub, the all in one platform for seamless event management and easy event booking. Built for both organizations and individual customers,
           MemoriaApex simplifies every step of the planning process—from managing large-scale events
           to booking private celebrations. It’s efficient, intuitive, and entirely digital.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center bg-gray-900/80 backdrop-blur-md border border-gray-700 hover:border-pink-400/50 transition-all hover:shadow-lg hover:shadow-pink-500/20">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 rounded-full bg-pink-500/10 border border-pink-400/30 w-fit">
                <CalendarDays className="h-10 w-10 text-pink-400" />
              </div>
              <CardTitle className="text-white">Event Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Plan and schedule events with detailed information, dates, and venue management.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-gray-900/80 backdrop-blur-md border border-gray-700 hover:border-purple-400/50 transition-all hover:shadow-lg hover:shadow-purple-500/20">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 rounded-full bg-purple-500/10 border border-purple-400/30 w-fit">
                <Users className="h-10 w-10 text-purple-400" />
              </div>
              <CardTitle className="text-white">Client & Vendor Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Manage client relationships and vendor networks with comprehensive contact information.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-gray-900/80 backdrop-blur-md border border-gray-700 hover:border-blue-400/50 transition-all hover:shadow-lg hover:shadow-blue-500/20">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 rounded-full bg-blue-500/10 border border-blue-400/30 w-fit">
                <Building2 className="h-10 w-10 text-blue-400" />
              </div>
              <CardTitle className="text-white">Budget & Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Track expenses, manage budgets, and generate comprehensive reports for better insights.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-8" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
            Choose Your Role
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Card */}
            <Card className="bg-gray-900/80 backdrop-blur-md border border-gray-700 hover:border-pink-400/50 transition-all hover:shadow-lg hover:shadow-pink-500/20">
              <CardHeader className="text-center pb-4">
                <div className="bg-pink-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-400/50 glow-pink">
                  <UserCheck className="h-8 w-8 text-pink-400" />
                </div>
                <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-300">
                  I'm a User
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Looking to book and manage my own events
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-3 mb-8 text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full glow-pink-xs"></div>
                    Book personal or business events
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full glow-pink-xs"></div>
                    Manage your event details and timeline
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full glow-pink-xs"></div>
                    Track your event budgets and expenses
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full glow-pink-xs"></div>
                    Access personalized event dashboard
                  </li>
                </ul>
                <Button 
                  onClick={() => handleRoleSelection('user')}
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white py-3 text-lg shadow-lg hover:shadow-pink-500/30 transition-all"
                  size="lg"
                >
                  Continue as User
                </Button>
              </CardContent>
            </Card>

            {/* Worker Card */}
            <Card className="bg-gray-900/80 backdrop-blur-md border border-gray-700 hover:border-purple-400/50 transition-all hover:shadow-lg hover:shadow-purple-500/20">
              <CardHeader className="text-center pb-4">
                <div className="bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-400/50 glow-purple">
                  <Settings className="h-8 w-8 text-purple-400" />
                </div>
                <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-300">
                  I'm a Worker
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Professional event planning manager
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-3 mb-8 text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full glow-purple-xs"></div>
                    View and manage all client events
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full glow-purple-xs"></div>
                    Comprehensive client management
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full glow-purple-xs"></div>
                    Vendor network management
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full glow-purple-xs"></div>
                    Advanced reporting and analytics
                  </li>
                </ul>
                <Button 
                  onClick={() => handleRoleSelection('worker')}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white py-3 text-lg shadow-lg hover:shadow-purple-500/30 transition-all"
                  size="lg"
                >
                  Continue as Worker
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-400">
          <p>Plan smarter. Book faster. Celebrate better.</p>
        </div>
      </div>

      {/* Add these to your global CSS */}
      <style>{`
        .glow-pink {
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
        }
        .glow-purple {
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
        .glow-pink-xs {
          box-shadow: 0 0 4px rgba(236, 72, 153, 0.7);
        }
        .glow-purple-xs {
          box-shadow: 0 0 4px rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
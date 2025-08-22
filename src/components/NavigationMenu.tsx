import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, Users, Calendar, User, DollarSign, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const menuItems = [
  { path: '/dashboard', name: 'Dashboard', icon: <BarChart3 className="h-5 w-5" /> },
  { path: '/clients', name: 'Clients', icon: <Users className="h-5 w-5" /> },
  { path: '/events', name: 'Events', icon: <Calendar className="h-5 w-5" /> },
  { path: '/vendors', name: 'Vendors', icon: <User className="h-5 w-5" /> },
  { path: '/budget', name: 'Budget', icon: <DollarSign className="h-5 w-5" /> },
];

const NavigationMenu: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Signed out successfully" });
      navigate('/auth');
    } catch {
      toast({ title: "Error signing out", variant: "destructive" });
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-700 bg-gray-900 p-4 text-white">
      <div className="mb-10 text-center text-2xl font-bold">EventSys</div>
      <nav className="flex-grow">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `my-2 flex items-center gap-4 rounded-lg px-4 py-3 transition-colors ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto">
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="flex w-full items-center gap-2 border-gray-600 hover:border-red-500 hover:bg-red-600"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default NavigationMenu;
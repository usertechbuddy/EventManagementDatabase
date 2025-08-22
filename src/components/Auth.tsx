import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthSuccess();
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        
        setError('Check your email for the confirmation link!');
      }
    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message.includes('User already registered')) {
        setError('An account with this email already exists. Try logging in instead.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // CSS for the background is now included directly here.
  // You can also move this to your main CSS file.
  const sparkleCss = `
    @keyframes move-sparkles {
      from { transform: translateY(0); }
      to { transform: translateY(-100vh); }
    }

    .sparkle-container {
      position: relative;
      min-height: 100vh;
      width: 100%;
      background-color: #1f023aff;
      overflow: hidden;
    }

    .sparkles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 200vh; /* Taller to allow for seamless animation */
      background-image: 
        radial-gradient(1px 1px at 20% 30%, #fff, transparent),
        radial-gradient(1px 1px at 80% 10%, #fff, transparent),
        radial-gradient(1.5px 1.5px at 50% 50%, #fff, transparent),
        radial-gradient(2px 2px at 10% 90%, #fff, transparent),
        radial-gradient(2.5px 2.5px at 90% 40%, #fff, transparent),
        radial-gradient(1.5px 1.5px at 30% 70%, #fff, transparent);
      background-repeat: repeat;
      background-size: 500px 500px;
      animation: move-sparkles 150s linear infinite;
    }

    .sparkles.fast {
        background-size: 300px 300px;
        animation-duration: 75s;
        opacity: 0.8;
    }

    .sparkles.faster {
        background-size: 200px 200px;
        animation-duration: 50s;
        opacity: 0.6;
    }
  `;

  return (
    <>
      <style>{sparkleCss}</style>
      <div className="sparkle-container flex items-center justify-center p-4">
        {/* Three layers of sparkles for a parallax effect */}
        <div className="sparkles"></div>
        <div className="sparkles fast"></div>
        <div className="sparkles faster"></div>
        
        <Card className="w-full max-w-md z-10 bg-white/10 backdrop-filter backdrop-blur-lg border border-gray-400/20 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {isLogin 
                ? 'Sign in to MemoriaApex Event Hub account' 
                : 'Sign up to start managing your events'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="bg-white/20 border-0 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/20 border-0 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/20 border-0 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant={error.includes('Check your email') ? 'default' : 'destructive'} className="bg-opacity-50 text-white">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </p>
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                className="mt-1 text-blue-400 hover:text-blue-300"
              >
                {isLogin ? 'Sign up here' : 'Sign in here'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Auth;

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, WifiIcon } from "lucide-react";
import { login, checkAuth } from '../lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    async function checkIfLoggedIn() {
      try {
        console.log("Checking if already logged in...");
        const user = await checkAuth();
        
        if (user) {
          console.log("User already authenticated:", user);
          setAlreadyLoggedIn(true);
          
          // Add small delay to show the "already logged in" message
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setChecking(false);
      }
    }
    
    checkIfLoggedIn();
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("Attempting login with:", formData.username);
      const result = await login(formData.username, formData.password);
      console.log("Login result:", result);

      if (result.success && result.user) {
        console.log("Login successful:", result.user);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.user.name}!`,
          duration: 3000,
        });
        
        // Set a marker in localStorage to indicate successful login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', result.user.id.toString());
        
        // Redirect to dashboard - fixed URL
        window.location.href = '/';
        return;
      } else {
        console.error("Login failed:", result.message);
        setError(result.message || 'Invalid username or password');
        
        // Clear any previous login data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      
      // Clear any previous login data
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-medium">Checking authentication status...</h2>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show already logged in message
  if (alreadyLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-medium">You're already logged in</h2>
              <p className="text-muted-foreground mt-2">Redirecting to dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
            <WifiIcon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">ISP Sales Platform</CardTitle>
          <CardDescription className="text-center">
            Manage wireless and fiber connectivity sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div className="text-sm text-center text-gray-500 pt-2">
              <p className="font-medium mb-1">Demo Credentials:</p>
              <div className="space-y-1">
                <p>Username: <span className="font-mono bg-muted px-1 rounded">admin</span>, Password: <span className="font-mono bg-muted px-1 rounded">password</span></p>
                <p>Username: <span className="font-mono bg-muted px-1 rounded">alex.morgan</span>, Password: <span className="font-mono bg-muted px-1 rounded">password</span></p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

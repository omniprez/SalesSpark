
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { checkAuth } from '../lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check localStorage first for quick render if user previously logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    async function verifyAuth() {
      try {
        console.log("Verifying authentication...");
        const user = await checkAuth();
        console.log("Auth verification result:", user);
        
        if (user) {
          console.log("User is authenticated:", user);
          setAuthenticated(true);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', user.id.toString());
        } else {
          console.error("User not authenticated, redirecting to login");
          toast({
            title: "Authentication Required",
            description: "Please log in to access this page",
            variant: "destructive",
            duration: 3000,
          });
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userId');
          // Use setLocation for routing instead of window.location
          setLocation('/login');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth verification error:', error);
        toast({
          title: "Authentication Error",
          description: "Please log in to continue",
          variant: "destructive",
          duration: 3000,
        });
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        // Use setLocation for routing instead of window.location
        setLocation('/login');
        setLoading(false);
      }
    }
    
    // If we have a local indicator of being logged in, render children right away
    // while we verify in the background
    if (isLoggedIn) {
      setAuthenticated(true);
      setLoading(false);
    }
    
    // Always verify authentication with the server
    verifyAuth();
  }, [setLocation, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium">Redirecting to login...</h2>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

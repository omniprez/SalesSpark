
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { checkAuth } from '../lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    async function verifyAuth() {
      try {
        const user = await checkAuth();
        
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access this page",
            variant: "destructive",
            duration: 3000,
          });
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
        setLocation('/login');
        setLoading(false);
      }
    }
    
    verifyAuth();
  }, [setLocation, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

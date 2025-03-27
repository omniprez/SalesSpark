
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  useEffect(() => {
    // Add Replit auth script
    const script = document.createElement('script');
    script.src = "https://auth.util.repl.co/script.js";
    script.setAttribute('authed', 'window.location.href = "/"');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-center text-sm text-muted-foreground">
            Click below to sign in with your Replit account
          </div>
          <div id="auth-button" className="flex justify-center" />
        </CardContent>
      </Card>
    </div>
  );
}

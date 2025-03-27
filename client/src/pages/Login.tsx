
import { useEffect } from 'react';

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
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
        </div>
        {/* Replit Auth button will be injected here */}
        <div id="auth-button" className="flex justify-center"></div>
      </div>
    </div>
  );
}

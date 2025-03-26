import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import SalesPipeline from "@/pages/SalesPipeline";
import Leaderboard from "@/pages/Leaderboard";
import TeamManagement from "@/pages/TeamManagement";
import Achievements from "@/pages/Achievements";
import Layout from "@/components/Layout";

// Simple component to debug rendering issues
function SimpleDebugView() {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      textAlign: 'center',
      background: '#fff', 
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginTop: '50px'
    }}>
      <h1 style={{ color: '#0052CC', marginBottom: '20px' }}>ISP Sales Management Platform</h1>
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>Debug Mode: If you can see this message, the React app is rendering correctly.</p>
      <div style={{ 
        background: '#F4F5F7', 
        padding: '15px', 
        borderRadius: '4px',
        marginBottom: '20px' 
      }}>
        <p>This is a diagnostic view to test if the application is rendering properly.</p>
      </div>
      <button style={{ 
        background: '#0052CC', 
        color: 'white', 
        border: 'none', 
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>Test Button</button>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/pipeline" component={SalesPipeline} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/team" component={TeamManagement} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/debug" component={SimpleDebugView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  console.log("App component rendering");
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Router />
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

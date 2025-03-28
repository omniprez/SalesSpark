import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import SalesPipeline from "@/pages/SalesPipeline";
import Leaderboard from "@/pages/Leaderboard";
import TeamManagement from "@/pages/TeamManagement";
import Achievements from "@/pages/Achievements";
import RewardsAndIncentives from "@/pages/RewardsAndIncentives";
import WeeklyPipeline from "@/pages/WeeklyPipeline";
import TeamPipeline from "@/pages/TeamPipeline";
import AdminDashboard from "@/pages/AdminDashboard";
import TestPage from "@/pages/TestPage";
import Debug from "@/pages/Debug";
import Layout from "@/components/Layout";
import Login from './pages/Login';
import AuthGuard from './components/AuthGuard';
import UserProfile from './pages/UserProfile';
import CSVImport from './pages/CSVImport';


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
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/debug">
        <Debug />
      </Route>
      <Route>
        <AuthGuard>
          <Layout>
            <Switch>
              <Route path="/">
                <Dashboard />
              </Route>
              <Route path="/pipeline">
                <SalesPipeline />
              </Route>
              <Route path="/weekly-pipeline">
                <WeeklyPipeline />
              </Route>
              <Route path="/team-pipeline">
                <TeamPipeline />
              </Route>
              <Route path="/admin">
                <AdminDashboard />
              </Route>
              <Route path="/leaderboard">
                <Leaderboard />
              </Route>
              <Route path="/team">
                <TeamManagement />
              </Route>
              <Route path="/achievements">
                <Achievements />
              </Route>
              <Route path="/rewards">
                <RewardsAndIncentives />
              </Route>
              <Route path="/profile">
                <UserProfile />
              </Route>
              <Route path="/import">
                <CSVImport />
              </Route>
              <Route path="/simpledebug">
                <SimpleDebugView />
              </Route>
              <Route path="/test">
                <TestPage />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Layout>
        </AuthGuard>
      </Route>
    </Switch>
  );
}

function App() {
  console.log("App component rendering");
  
  // Check if we have a stored login state
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  console.log("Initial login state:", isLoggedIn);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        {/* Only show this header during initial load, hide it once content is rendered */}
        <div className="fallback-header" style={{ display: 'none' }}>
          <h1>ISP Sales Management Platform</h1>
          <p>Loading application...</p>
        </div>

        {/* Main application content */}
        <Router />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
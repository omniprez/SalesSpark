import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDealSchema, insertUserSchema, insertCustomerSchema, insertActivitySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
// Extend express Request type to include user property
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      name: string;
      role: string;
    };
  }
}

// Extend express Request type to include user property
declare module 'express' {
  interface Request {
    user?: {
      id: number;
      username: string;
      name?: string;
      role?: string;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - supports both session and Replit auth
  const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // First check for session-based auth
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }
    
    // Fallback to cookie-based auth
    if (req.cookies && req.cookies.user_id) {
      const userId = req.cookies.user_id;
      storage.getUser(parseInt(userId))
        .then(user => {
          if (user) {
            req.user = { 
              id: user.id, 
              username: user.username,
              name: user.name,
              role: user.role
            };
            return next();
          }
          return res.status(401).json({ error: 'Invalid authentication' });
        })
        .catch(err => {
          console.error("Auth middleware error:", err);
          return res.status(500).json({ error: 'Server error' });
        });
      return;
    }
    
    // Fallback to Replit auth headers for development
    const userId = req.headers['x-replit-user-id'];
    const username = req.headers['x-replit-user-name'];
    
    if (userId && username) {
      req.user = { 
        id: parseInt(userId as string), 
        username: username as string 
      };
      return next();
    }
    
    return res.status(401).json({ error: 'Not authenticated' });
  };

  // Get current user
  app.get("/api/me", authMiddleware, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = req.user;
    const dbUser = await storage.getUser(parseInt(user.id.toString()));
    
    if (!dbUser) {
      // Create new user if first time
      const newUser = await storage.createUser({
        username: user.username,
        name: user.username,
        email: `${user.username}@replit.com`,
        password: '', // Not needed with Replit Auth
        role: 'user',
      });
      res.json(newUser);
    } else {
      res.json(dbUser);
    }
  });

  // Login route
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    try {
      console.log("Processing login request for user:", username);
      
      if (!username || !password) {
        console.log("Missing login credentials");
        return res.status(400).json({ 
          success: false,
          message: 'Username and password are required' 
        });
      }
      
      const user = await storage.getUserByUsername(username);
      console.log("Login attempt for user:", username);
      console.log("User found in database:", user ? "Yes" : "No");
      
      if (user) {
        console.log("Found user details:", { 
          id: user.id, 
          username: user.username,
          storedPassword: user.password,
          providedPassword: password,
          passwordMatch: user.password === password
        });
      }
      
      if (!user || user.password !== password) {
        console.log("Invalid credentials for user:", username);
        return res.status(401).json({ 
          success: false,
          message: 'Invalid username or password' 
        });
      }

      // Store user info in session
      const userInfo = { 
        id: user.id, 
        username: user.username,
        name: user.name,
        role: user.role
      };
      
      // Set in session
      if (req.session) {
        req.session.user = userInfo;
        console.log("User info stored in session:", req.session.id);
        
        // Force session save to ensure it's stored before responding
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session:", err);
          }
        });
      } else {
        console.warn("Session object not available");
      }
      
      // Also set cookie as fallback for older versions
      res.cookie('user_id', user.id.toString(), { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      console.log("Login successful for user:", username);
      res.json({ 
        success: true, 
        user: userInfo
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred during login. Please try again.'
      });
    }
  });

  // Auth check route
  app.get("/api/auth/check", async (req: Request, res: Response) => {
    console.log("Auth check request received");
    console.log("Session ID:", req.session?.id);
    console.log("Session user:", req.session?.user);
    console.log("Headers:", req.headers);
    console.log("Cookies:", req.cookies);
    
    try {
      // First check session-based auth
      if (req.session && req.session.user) {
        console.log("User authenticated via session:", req.session.user);
        return res.json({ 
          authenticated: true, 
          user: req.session.user,
          authMethod: 'session'
        });
      }
      
      // Then check cookie-based auth
      if (req.cookies && req.cookies.user_id) {
        const userId = parseInt(req.cookies.user_id);
        
        if (isNaN(userId)) {
          console.log("Invalid user_id cookie value");
          return res.status(401).json({ authenticated: false });
        }
        
        const user = await storage.getUser(userId);
        if (user) {
          const userInfo = { 
            id: user.id, 
            username: user.username,
            name: user.name,
            role: user.role
          };
          
          // Update session with user info for future requests
          if (req.session) {
            req.session.user = userInfo;
          }
          
          console.log("User authenticated via cookie:", userInfo);
          return res.json({ 
            authenticated: true, 
            user: userInfo,
            authMethod: 'cookie'
          });
        } else {
          console.log("No user found for cookie ID:", userId);
          res.clearCookie('user_id');
          return res.status(401).json({ authenticated: false });
        }
      }
      
      // If no authentication found
      console.log("No authentication found");
      return res.status(401).json({ authenticated: false });
    } catch (err) {
      console.error("Error during authentication check:", err);
      return res.status(500).json({ 
        authenticated: false,
        error: 'Server error during authentication check' 
      });
    }
  });
  
  // Logout route
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    console.log("Logout request received");
    console.log("Session ID:", req.session?.id);
    console.log("Session user:", req.session?.user);
    
    // Clear session
    if (req.session) {
      const sessionId = req.session.id;
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        } else {
          console.log("Session destroyed successfully:", sessionId);
        }
      });
    }
    
    // Clear all auth cookies
    res.clearCookie('user_id');
    res.clearCookie('isp_sales_sid');
    
    // Use more secure settings for cookie clearing
    res.clearCookie('user_id', { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.clearCookie('isp_sales_sid', { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    console.log("Cookies cleared during logout");
    
    res.json({ success: true, message: 'Logged out successfully' });
  });
  
  // Dashboard routes
  app.get("/api/dashboard", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const dashboardData = await storage.getDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });
  
  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  
  // Deals routes
  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await storage.getDeals();
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });
  
  app.get("/api/deals/:id", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const deal = await storage.getDeal(dealId);
      
      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      
      res.json(deal);
    } catch (error) {
      console.error("Error fetching deal:", error);
      res.status(500).json({ error: "Failed to fetch deal" });
    }
  });
  
  app.post("/api/deals", async (req, res) => {
    try {
      const dealData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(dealData);
      res.status(201).json(deal);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error creating deal:", error);
      res.status(500).json({ error: "Failed to create deal" });
    }
  });
  
  app.patch("/api/deals/:id", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const dealData = req.body;
      
      // Here we would normally validate the update data
      
      const updatedDeal = await storage.updateDeal(dealId, dealData);
      
      if (!updatedDeal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      
      res.json(updatedDeal);
    } catch (error) {
      console.error("Error updating deal:", error);
      res.status(500).json({ error: "Failed to update deal" });
    }
  });
  
  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });
  
  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });
  
  // Leaderboard route
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  
  // Sales Pipeline route
  app.get("/api/pipeline", async (req, res) => {
    try {
      const pipeline = await storage.getSalesPipelineData();
      res.json(pipeline);
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
      res.status(500).json({ error: "Failed to fetch pipeline data" });
    }
  });
  
  // Performance Overview route
  app.get("/api/performance", async (req, res) => {
    try {
      const performance = await storage.getPerformanceOverview();
      res.json(performance);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });
  
  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      let activities;
      if (limit) {
        activities = await storage.getRecentActivities(limit);
      } else {
        activities = await storage.getActivities();
      }
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });
  
  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error creating activity:", error);
      res.status(500).json({ error: "Failed to create activity" });
    }
  });
  
  // User achievements route
  app.get("/api/users/:id/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });
  
  // Add test endpoint
  app.get("/api/test", (req, res) => {
    res.json({ status: "ok", message: "Server is responding" });
  });

  // Add a route for a simple test HTML page to diagnose issues
  app.get("/simple-test", (req, res) => {
    res.sendFile(process.cwd() + "/client/index-test.html");
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}

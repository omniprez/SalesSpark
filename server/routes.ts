import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDealSchema, insertUserSchema, insertCustomerSchema, insertActivitySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  const authMiddleware = (req: any, res: any, next: any) => {
    const userId = req.headers['x-replit-user-id'];
    const username = req.headers['x-replit-user-name'];
    
    if (!userId || !username) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    req.user = { id: userId, username };
    next();
  };

  // Get current user
  app.get("/api/me", authMiddleware, async (req, res) => {
    const { user } = req;
    const dbUser = await storage.getUser(parseInt(user.id));
    
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
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    try {
      const user = await storage.getUserByUsername(username);
      console.log("Login attempt for user:", username);
      console.log("User found in database:", user);
      
      if (!user || user.password !== password) {
        console.log("Invalid credentials");
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Set session cookie
      res.cookie('user_id', user.id, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      console.log("Login successful for user:", username);
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username,
          name: user.name,
          role: user.role
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Auth check route
  app.get("/api/auth/check", authMiddleware, (req, res) => {
    res.json({ authenticated: true, user: req.user });
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

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}

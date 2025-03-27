import { 
  User, InsertUser, Team, InsertTeam, Deal, InsertDeal, 
  Customer, InsertCustomer, Product, InsertProduct, 
  Achievement, InsertAchievement, UserAchievement, InsertUserAchievement,
  Activity, InsertActivity, Target, InsertTarget
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getUsersByTeam(teamId: number): Promise<User[]>;
  
  // Team operations
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  getTeams(): Promise<Team[]>;
  
  // Deal operations
  getDeal(id: number): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  getDeals(): Promise<Deal[]>;
  getDealsByUser(userId: number): Promise<Deal[]>;
  getDealsByStage(stage: string): Promise<Deal[]>;
  getDealsByCategory(category: string): Promise<Deal[]>;
  updateDeal(id: number, deal: Partial<Deal>): Promise<Deal | undefined>;
  
  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomers(): Promise<Customer[]>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  
  // Achievement operations
  getAchievement(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievements(): Promise<Achievement[]>;
  
  // User achievements
  getUserAchievements(userId: number): Promise<{achievement: Achievement, earnedAt: Date}[]>;
  awardAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  
  // Activity operations
  getActivities(): Promise<Activity[]>;
  getActivitiesByUser(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  
  // Performance targets
  getTargets(userId: number): Promise<Target[]>;
  createTarget(target: InsertTarget): Promise<Target>;
  updateTarget(id: number, target: Partial<Target>): Promise<Target | undefined>;
  
  // Dashboard data
  getDashboardData(userId?: number): Promise<any>;
  getLeaderboard(): Promise<any[]>;
  getSalesPipelineData(): Promise<any[]>;
  getPerformanceOverview(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private teams: Map<number, Team>;
  private deals: Map<number, Deal>;
  private customers: Map<number, Customer>;
  private products: Map<number, Product>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private activities: Map<number, Activity>;
  private targets: Map<number, Target>;
  
  private userCounter: number;
  private teamCounter: number;
  private dealCounter: number;
  private customerCounter: number;
  private productCounter: number;
  private achievementCounter: number;
  private userAchievementCounter: number;
  private activityCounter: number;
  private targetCounter: number;

  constructor() {
    this.users = new Map();
    this.teams = new Map();
    this.deals = new Map();
    this.customers = new Map();
    this.products = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.activities = new Map();
    this.targets = new Map();
    
    this.userCounter = 1;
    this.teamCounter = 1;
    this.dealCounter = 1;
    this.customerCounter = 1;
    this.productCounter = 1;
    this.achievementCounter = 1;
    this.userAchievementCounter = 1;
    this.activityCounter = 1;
    this.targetCounter = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const allUsers = Array.from(this.users.values());
    console.log(`Searching for user with username: "${username}"`);
    console.log("Available users:", allUsers.map(u => ({ id: u.id, username: u.username })));
    
    // Case-insensitive search
    const foundUser = allUsers.find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
    
    if (foundUser) {
      console.log(`Found user:`, foundUser);
      return foundUser;
    } else {
      console.log(`No user found with username: "${username}"`);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByTeam(teamId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.teamId === teamId);
  }

  // Team operations
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.teamCounter++;
    const now = new Date();
    const team: Team = { ...insertTeam, id, createdAt: now };
    this.teams.set(id, team);
    return team;
  }

  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  // Deal operations
  async getDeal(id: number): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = this.dealCounter++;
    const now = new Date();
    const deal: Deal = {
      ...insertDeal,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.deals.set(id, deal);
    
    // Create an activity for this deal
    await this.createActivity({
      userId: deal.userId,
      type: 'deal_created',
      content: `New deal created: ${deal.name}`,
      relatedId: deal.id,
      metadata: { dealValue: deal.value, dealCategory: deal.category }
    });
    
    return deal;
  }

  async getDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }

  async getDealsByUser(userId: number): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => deal.userId === userId);
  }

  async getDealsByStage(stage: string): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => deal.stage === stage);
  }

  async getDealsByCategory(category: string): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => deal.category === category);
  }

  async updateDeal(id: number, dealData: Partial<Deal>): Promise<Deal | undefined> {
    const deal = this.deals.get(id);
    if (!deal) return undefined;
    
    const updatedDeal = { 
      ...deal, 
      ...dealData,
      updatedAt: new Date() 
    };
    this.deals.set(id, updatedDeal);
    
    // If deal status changed to closed_won, create an activity
    if (dealData.stage === 'closed_won' && deal.stage !== 'closed_won') {
      await this.createActivity({
        userId: deal.userId,
        type: 'deal_won',
        content: `Deal won: ${deal.name}`,
        relatedId: deal.id,
        metadata: { dealValue: deal.value, dealCategory: deal.category }
      });
    }
    
    return updatedDeal;
  }

  // Customer operations
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerCounter++;
    const now = new Date();
    const customer: Customer = { ...insertCustomer, id, createdAt: now };
    this.customers.set(id, customer);
    return customer;
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productCounter++;
    const now = new Date();
    const product: Product = { ...insertProduct, id, createdAt: now };
    this.products.set(id, product);
    return product;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.category === category);
  }

  // Achievement operations
  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementCounter++;
    const now = new Date();
    const achievement: Achievement = { ...insertAchievement, id, createdAt: now };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  // User achievements
  async getUserAchievements(userId: number): Promise<{achievement: Achievement, earnedAt: Date}[]> {
    const userAchievementsList = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
    
    return userAchievementsList.map(ua => {
      const achievement = this.achievements.get(ua.achievementId);
      if (!achievement) {
        throw new Error(`Achievement not found for id: ${ua.achievementId}`);
      }
      return {
        achievement,
        earnedAt: ua.earnedAt
      };
    });
  }

  async awardAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.userAchievementCounter++;
    const now = new Date();
    const userAchievement: UserAchievement = { 
      ...insertUserAchievement, 
      id, 
      earnedAt: now 
    };
    this.userAchievements.set(id, userAchievement);
    
    // Create an activity for this achievement
    const achievement = await this.getAchievement(userAchievement.achievementId);
    if (achievement) {
      await this.createActivity({
        userId: userAchievement.userId,
        type: 'achievement_earned',
        content: `Achievement earned: ${achievement.name}`,
        relatedId: achievement.id,
        metadata: { achievementName: achievement.name, achievementIcon: achievement.icon }
      });
    }
    
    return userAchievement;
  }

  // Activity operations
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityCounter++;
    const now = new Date();
    const activity: Activity = { ...insertActivity, id, createdAt: now };
    this.activities.set(id, activity);
    return activity;
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Performance targets
  async getTargets(userId: number): Promise<Target[]> {
    return Array.from(this.targets.values())
      .filter(target => target.userId === userId);
  }

  async createTarget(insertTarget: InsertTarget): Promise<Target> {
    const id = this.targetCounter++;
    const now = new Date();
    const target: Target = { ...insertTarget, id, createdAt: now };
    this.targets.set(id, target);
    return target;
  }

  async updateTarget(id: number, targetData: Partial<Target>): Promise<Target | undefined> {
    const target = this.targets.get(id);
    if (!target) return undefined;
    
    const updatedTarget = { ...target, ...targetData };
    this.targets.set(id, updatedTarget);
    return updatedTarget;
  }

  // Dashboard data
  async getDashboardData(userId?: number): Promise<any> {
    // Calculate totals
    const allDeals = Array.from(this.deals.values());
    
    // Filter by user if userId is provided
    const filteredDeals = userId 
      ? allDeals.filter(deal => deal.userId === userId)
      : allDeals;
    
    // Calculate total revenue
    const totalRevenue = filteredDeals
      .filter(deal => deal.stage === 'closed_won')
      .reduce((sum, deal) => sum + deal.value, 0);
    
    // Count won deals
    const dealsWon = filteredDeals
      .filter(deal => deal.stage === 'closed_won')
      .length;
    
    // Count active leads
    const activeLeads = filteredDeals
      .filter(deal => deal.stage !== 'closed_won' && deal.stage !== 'closed_lost')
      .length;
    
    // Calculate GP achieved
    const gpAchieved = filteredDeals
      .filter(deal => deal.stage === 'closed_won' && deal.gpPercentage)
      .reduce((sum, deal) => sum + (deal.gpPercentage || 0), 0);
    
    const avgGpPercentage = dealsWon > 0 ? Math.round(gpAchieved / dealsWon) : 0;
    
    // Count deals by stage
    const dealsByStage = {
      prospecting: filteredDeals.filter(deal => deal.stage === 'prospecting').length,
      qualification: filteredDeals.filter(deal => deal.stage === 'qualification').length,
      proposal: filteredDeals.filter(deal => deal.stage === 'proposal').length,
      negotiation: filteredDeals.filter(deal => deal.stage === 'negotiation').length,
      closed_won: filteredDeals.filter(deal => deal.stage === 'closed_won').length,
    };
    
    // Calculate revenue by stage
    const revenueByStage = {
      prospecting: filteredDeals.filter(deal => deal.stage === 'prospecting')
        .reduce((sum, deal) => sum + deal.value, 0),
      qualification: filteredDeals.filter(deal => deal.stage === 'qualification')
        .reduce((sum, deal) => sum + deal.value, 0),
      proposal: filteredDeals.filter(deal => deal.stage === 'proposal')
        .reduce((sum, deal) => sum + deal.value, 0),
      negotiation: filteredDeals.filter(deal => deal.stage === 'negotiation')
        .reduce((sum, deal) => sum + deal.value, 0),
      closed_won: filteredDeals.filter(deal => deal.stage === 'closed_won')
        .reduce((sum, deal) => sum + deal.value, 0),
    };
    
    // Get recent activities
    const recentActivities = await this.getRecentActivities(5);
    
    // Get targets for user
    let targets = [];
    if (userId) {
      targets = await this.getTargets(userId);
    }
    
    // Get user if userId is provided
    let user = undefined;
    if (userId) {
      user = await this.getUser(userId);
    }
    
    return {
      totalRevenue,
      dealsWon,
      activeLeads,
      gpPercentage: avgGpPercentage,
      dealsByStage,
      revenueByStage,
      recentActivities,
      targets,
      user
    };
  }

  async getLeaderboard(): Promise<any[]> {
    const users = await this.getUsers();
    const leaderboardData = [];
    
    for (const user of users) {
      const userDeals = await this.getDealsByUser(user.id);
      const wonDeals = userDeals.filter(deal => deal.stage === 'closed_won');
      
      const totalRevenue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
      const gpAchieved = wonDeals
        .filter(deal => deal.gpPercentage)
        .reduce((sum, deal) => sum + (deal.gpPercentage || 0), 0);
      
      const avgGpPercentage = wonDeals.length > 0 ? Math.round(gpAchieved / wonDeals.length) : 0;
      
      // Calculate growth percentage (random for demo purposes)
      const growth = Math.round((Math.random() * 20) - 5); // -5% to +15%
      
      const userTeam = user.teamId ? await this.getTeam(user.teamId) : null;
      
      leaderboardData.push({
        userId: user.id,
        name: user.name,
        revenue: totalRevenue,
        dealsWon: wonDeals.length,
        gpPercentage: avgGpPercentage,
        growth,
        avatar: user.avatar,
        teamType: user.isChannelPartner ? 'Channel Partner' : 'Internal Sales',
        teamName: userTeam?.name
      });
    }
    
    // Sort by revenue (highest first)
    return leaderboardData.sort((a, b) => b.revenue - a.revenue);
  }

  async getSalesPipelineData(): Promise<any[]> {
    const deals = await this.getDeals();
    const pipelineDeals = [];
    
    for (const deal of deals) {
      if (deal.stage === 'closed_lost') continue;
      
      const user = await this.getUser(deal.userId);
      const customer = await this.getCustomer(deal.customerId);
      
      pipelineDeals.push({
        id: deal.id,
        name: deal.name,
        value: deal.value,
        stage: deal.stage,
        category: deal.category,
        clientType: deal.clientType,
        region: deal.region,
        user: {
          id: user?.id,
          name: user?.name,
          avatar: user?.avatar
        },
        customer: {
          id: customer?.id,
          name: customer?.name,
          industry: customer?.industry
        },
        expectedCloseDate: deal.expectedCloseDate,
        daysInStage: Math.floor(Math.random() * 30) + 1 // Simulated for demo
      });
    }
    
    return pipelineDeals;
  }

  async getPerformanceOverview(): Promise<any> {
    const allDeals = await this.getDeals();
    const closedDeals = allDeals.filter(deal => deal.stage === 'closed_won');
    
    // Calculate quotas
    const totalTarget = 1000000; // $1M target
    const achievedRevenue = closedDeals.reduce((sum, deal) => sum + deal.value, 0);
    const quotaCompletion = Math.round((achievedRevenue / totalTarget) * 100);
    
    // Calculate win rate
    const potentialDeals = allDeals.filter(
      deal => deal.stage === 'closed_won' || deal.stage === 'closed_lost'
    );
    const winRate = potentialDeals.length > 0 
      ? Math.round((closedDeals.length / potentialDeals.length) * 100)
      : 0;
    
    // Calculate product performance
    const productCategories = [
      {
        name: 'Enterprise Wireless',
        category: 'wireless',
        clientType: 'B2B',
        trend: 12
      },
      {
        name: 'Carrier Fiber',
        category: 'fiber',
        clientType: 'carrier',
        trend: 8
      },
      {
        name: 'SMB Wireless',
        category: 'wireless',
        clientType: 'B2B',
        trend: -3
      },
      {
        name: 'Regional Fiber',
        category: 'fiber',
        clientType: 'regional',
        trend: 5
      }
    ];
    
    const productPerformance = productCategories.map(product => {
      const productDeals = closedDeals.filter(
        deal => deal.category === product.category && deal.clientType === product.clientType
      );
      
      const revenue = productDeals.reduce((sum, deal) => sum + deal.value, 0);
      const dealsCount = productDeals.length;
      
      const gpTotal = productDeals
        .filter(deal => deal.gpPercentage)
        .reduce((sum, deal) => sum + (deal.gpPercentage || 0), 0);
      
      const gpPercentage = dealsCount > 0 ? Math.round(gpTotal / dealsCount) : 0;
      
      return {
        name: product.name,
        revenue,
        deals: dealsCount,
        gpPercentage,
        trend: product.trend
      };
    });
    
    return {
      quotaCompletion,
      winRate,
      productPerformance
    };
  }

  // Initialize with sample data for development
  private async initializeData() {
    // Create teams
    const internalTeam = await this.createTeam({
      name: 'Internal Sales Team',
      region: 'National',
      type: 'internal'
    });
    
    const channelTeam = await this.createTeam({
      name: 'Channel Partners',
      region: 'National',
      type: 'channel_partner'
    });
    
    // Create sample users
    const adminUser = await this.createUser({
      username: 'admin',
      password: 'password',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Administrator',
      teamId: internalTeam.id,
      isChannelPartner: false,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    const alexMorgan = await this.createUser({
      username: 'alex.morgan',
      password: 'password',
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      role: 'Sales Manager',
      teamId: internalTeam.id,
      isChannelPartner: false,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    const jessicaTaylor = await this.createUser({
      username: 'jessica.taylor',
      password: 'password',
      name: 'Jessica Taylor',
      email: 'jessica.taylor@example.com',
      role: 'Sales Representative',
      teamId: internalTeam.id,
      isChannelPartner: false,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    const michaelChen = await this.createUser({
      username: 'michael.chen',
      password: 'password',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      role: 'Channel Manager',
      teamId: channelTeam.id,
      isChannelPartner: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    const sarahJohnson = await this.createUser({
      username: 'sarah.johnson',
      password: 'password',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'Sales Representative',
      teamId: internalTeam.id,
      isChannelPartner: false,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    const davidWilson = await this.createUser({
      username: 'david.wilson',
      password: 'password',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      role: 'Sales Representative',
      teamId: internalTeam.id,
      isChannelPartner: false,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    const emilyRodriguez = await this.createUser({
      username: 'emily.rodriguez',
      password: 'password',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      role: 'Channel Partner',
      teamId: channelTeam.id,
      isChannelPartner: true,
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    // Create sample customers
    const acmeCorp = await this.createCustomer({
      name: 'ACME Corporation',
      industry: 'Technology',
      size: 'enterprise',
      region: 'Northeast',
      contact: {
        name: 'John Smith',
        email: 'john.smith@acme.com',
        phone: '555-123-4567'
      }
    });
    
    const techSolutions = await this.createCustomer({
      name: 'TechSolutions Inc',
      industry: 'IT Services',
      size: 'medium',
      region: 'West',
      contact: {
        name: 'Lisa Johnson',
        email: 'lisa.johnson@techsolutions.com',
        phone: '555-987-6543'
      }
    });
    
    const globalLogistics = await this.createCustomer({
      name: 'Global Logistics',
      industry: 'Transportation',
      size: 'enterprise',
      region: 'Southeast',
      contact: {
        name: 'Robert Chen',
        email: 'robert.chen@globallogistics.com',
        phone: '555-456-7890'
      }
    });
    
    // Create sample products
    const enterpriseWireless = await this.createProduct({
      name: 'Enterprise Wireless Network',
      category: 'wireless',
      description: 'High-performance wireless networking solutions for enterprise customers'
    });
    
    const fiberConnectivity = await this.createProduct({
      name: 'Fiber Connectivity',
      category: 'fiber',
      description: 'High-speed fiber optic connectivity for businesses'
    });
    
    // Create sample deals
    const deal1 = await this.createDeal({
      name: 'ACME Corporation - Wireless Network Expansion',
      value: 125000,
      category: 'wireless',
      stage: 'proposal',
      customerId: acmeCorp.id,
      userId: sarahJohnson.id,
      gpPercentage: 65,
      expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
      region: 'Northeast',
      clientType: 'B2B',
      dealType: 'expansion'
    });
    
    const deal2 = await this.createDeal({
      name: 'TechSolutions Inc - Fiber Network Installation',
      value: 98750,
      category: 'fiber',
      stage: 'negotiation',
      customerId: techSolutions.id,
      userId: michaelChen.id,
      gpPercentage: 70,
      expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // 15 days from now
      region: 'West',
      clientType: 'regional',
      dealType: 'new'
    });
    
    const deal3 = await this.createDeal({
      name: 'Global Logistics - Wireless Backup System',
      value: 143200,
      category: 'wireless',
      stage: 'qualification',
      customerId: globalLogistics.id,
      userId: davidWilson.id,
      gpPercentage: 62,
      expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // 45 days from now
      region: 'Southeast',
      clientType: 'carrier',
      dealType: 'new'
    });
    
    // Create sample achievements
    const salesStar = await this.createAchievement({
      name: 'Sales Star',
      description: 'Close more than $100,000 in deals in a single month',
      icon: 'fa-trophy',
      category: 'sales',
      criteria: {
        type: 'revenue',
        threshold: 100000,
        period: 'monthly'
      }
    });
    
    const dealCloser = await this.createAchievement({
      name: 'Deal Closer',
      description: 'Close 10 deals in a quarter',
      icon: 'fa-handshake',
      category: 'sales',
      criteria: {
        type: 'deals',
        threshold: 10,
        period: 'quarterly'
      }
    });
    
    const fiberExpert = await this.createAchievement({
      name: 'Fiber Expert',
      description: 'Close 10 fiber deals this quarter',
      icon: 'fa-medal',
      category: 'product',
      criteria: {
        type: 'product_deals',
        product: 'fiber',
        threshold: 10,
        period: 'quarterly'
      }
    });
    
    // Award achievements to users
    await this.awardAchievement({
      userId: jessicaTaylor.id,
      achievementId: salesStar.id
    });
    
    await this.awardAchievement({
      userId: michaelChen.id,
      achievementId: dealCloser.id
    });
    
    await this.awardAchievement({
      userId: alexMorgan.id,
      achievementId: fiberExpert.id
    });
    
    // Create user targets
    await this.createTarget({
      userId: alexMorgan.id,
      targetType: 'revenue',
      period: 'monthly',
      startDate: new Date(new Date().setDate(1)), // First day of current month
      endDate: new Date(new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0)), // Last day of current month
      targetValue: 200000,
      currentValue: 156000
    });
  }
}

export const storage = new MemStorage();

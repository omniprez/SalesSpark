import { 
  User, InsertUser, Team, InsertTeam, Deal, InsertDeal, 
  Customer, InsertCustomer, Product, InsertProduct, 
  Achievement, InsertAchievement, UserAchievement, InsertUserAchievement,
  Activity, InsertActivity, Target, InsertTarget,
  Reward, InsertReward, UserReward, InsertUserReward,
  PointTransaction, InsertPointTransaction, Challenge, InsertChallenge,
  ChallengeParticipant, InsertChallengeParticipant
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
  
  // Rewards operations
  getReward(id: number): Promise<Reward | undefined>;
  createReward(reward: InsertReward): Promise<Reward>;
  getRewards(): Promise<Reward[]>;
  getRewardsByCategory(category: string): Promise<Reward[]>;
  getRewardsByType(type: string): Promise<Reward[]>;
  getAvailableRewards(): Promise<Reward[]>;
  
  // User rewards operations
  getUserRewards(userId: number): Promise<UserReward[]>;
  awardUserReward(userReward: InsertUserReward): Promise<UserReward>;
  updateUserRewardStatus(id: number, status: string): Promise<UserReward | undefined>;
  
  // Points operations
  getUserPoints(userId: number): Promise<number>;
  addPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction>;
  getPointTransactions(userId: number): Promise<PointTransaction[]>;
  
  // Challenge operations
  getChallenge(id: number): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallenges(active?: boolean): Promise<Challenge[]>;
  updateChallenge(id: number, challenge: Partial<Challenge>): Promise<Challenge | undefined>;
  
  // Challenge participant operations
  joinChallenge(participant: InsertChallengeParticipant): Promise<ChallengeParticipant>;
  getParticipantsByChallenge(challengeId: number): Promise<ChallengeParticipant[]>;
  getUserChallenges(userId: number): Promise<{challenge: Challenge, participant: ChallengeParticipant}[]>;
  updateChallengeParticipant(id: number, participant: Partial<ChallengeParticipant>): Promise<ChallengeParticipant | undefined>;
  
  // Gamification data methods
  getRewardsAndIncentivesData(userId?: number): Promise<any>;
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
  private rewards: Map<number, Reward>;
  private userRewards: Map<number, UserReward>;
  private pointTransactions: Map<number, PointTransaction>;
  private challenges: Map<number, Challenge>;
  private challengeParticipants: Map<number, ChallengeParticipant>;
  
  private userCounter: number;
  private teamCounter: number;
  private dealCounter: number;
  private customerCounter: number;
  private productCounter: number;
  private achievementCounter: number;
  private userAchievementCounter: number;
  private activityCounter: number;
  private targetCounter: number;
  private rewardCounter: number;
  private userRewardCounter: number;
  private pointTransactionCounter: number;
  private challengeCounter: number;
  private challengeParticipantCounter: number;

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
    this.rewards = new Map();
    this.userRewards = new Map();
    this.pointTransactions = new Map();
    this.challenges = new Map();
    this.challengeParticipants = new Map();
    
    this.userCounter = 1;
    this.teamCounter = 1;
    this.dealCounter = 1;
    this.customerCounter = 1;
    this.productCounter = 1;
    this.achievementCounter = 1;
    this.userAchievementCounter = 1;
    this.activityCounter = 1;
    this.targetCounter = 1;
    this.rewardCounter = 1;
    this.userRewardCounter = 1;
    this.pointTransactionCounter = 1;
    this.challengeCounter = 1;
    this.challengeParticipantCounter = 1;
    
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
    // Create teams with real business divisions
    const enterpriseTeam = await this.createTeam({
      name: 'Enterprise Solutions',
      region: 'National',
      type: 'internal'
    });
    
    const carrierTeam = await this.createTeam({
      name: 'Carrier Services',
      region: 'National',
      type: 'internal'
    });
    
    const regionalTeam = await this.createTeam({
      name: 'Regional Business',
      region: 'Central',
      type: 'internal'
    });
    
    const channelPartnersTeam = await this.createTeam({
      name: 'Channel Partner Network',
      region: 'National',
      type: 'channel_partner'
    });
    
    // Create system admin user
    const adminUser = await this.createUser({
      username: 'admin',
      password: 'password',
      name: 'System Administrator',
      email: 'admin@ispcompany.com',
      role: 'Administrator',
      teamId: null,
      isChannelPartner: false,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    // Create real sales team members
    const robertGarcia = await this.createUser({
      username: 'robert.garcia',
      password: 'password',
      name: 'Robert Garcia',
      email: 'robert.garcia@ispcompany.com',
      role: 'Enterprise Sales Director',
      teamId: enterpriseTeam.id,
      isChannelPartner: false,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    const lisaWilliams = await this.createUser({
      username: 'lisa.williams',
      password: 'password',
      name: 'Lisa Williams',
      email: 'lisa.williams@ispcompany.com',
      role: 'Enterprise Account Executive',
      teamId: enterpriseTeam.id,
      isChannelPartner: false,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    const davidThompson = await this.createUser({
      username: 'david.thompson',
      password: 'password',
      name: 'David Thompson',
      email: 'david.thompson@ispcompany.com',
      role: 'Carrier Services Manager',
      teamId: carrierTeam.id,
      isChannelPartner: false,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    const michellePatel = await this.createUser({
      username: 'michelle.patel',
      password: 'password',
      name: 'Michelle Patel',
      email: 'michelle.patel@ispcompany.com',
      role: 'Regional Sales Manager',
      teamId: regionalTeam.id,
      isChannelPartner: false,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    const jamesMurphy = await this.createUser({
      username: 'james.murphy',
      password: 'password',
      name: 'James Murphy',
      email: 'james.murphy@partnernetwork.com',
      role: 'Channel Partner Lead',
      teamId: channelPartnersTeam.id,
      isChannelPartner: true,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    // Create more team members
    // Regional team member
    const danielWong = await this.createUser({
      username: 'daniel.wong',
      password: 'password',
      name: 'Daniel Wong',
      email: 'daniel.wong@ispcompany.com',
      role: 'Regional Account Executive',
      teamId: regionalTeam.id,
      isChannelPartner: false,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    // Channel partner team member
    const emilySanchez = await this.createUser({
      username: 'emily.sanchez',
      password: 'password',
      name: 'Emily Sanchez',
      email: 'emily.sanchez@partnernetwork.com',
      role: 'Channel Partner Representative',
      teamId: channelPartnersTeam.id,
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
    
    // Create realistic deals for each team member
    // Enterprise deals
    const enterpriseDeal1 = await this.createDeal({
      name: 'ACME Corporation - Enterprise Wireless Network Expansion',
      value: 375000,
      category: 'wireless',
      stage: 'proposal',
      customerId: acmeCorp.id,
      userId: robertGarcia.id,
      gpPercentage: 65,
      expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
      region: 'Northeast',
      clientType: 'B2B',
      dealType: 'expansion'
    });
    
    const enterpriseDeal2 = await this.createDeal({
      name: 'TechSolutions Inc - Campus-wide Fiber Installation',
      value: 245000,
      category: 'fiber',
      stage: 'negotiation',
      customerId: techSolutions.id,
      userId: lisaWilliams.id,
      gpPercentage: 68,
      expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // 15 days from now
      region: 'West',
      clientType: 'B2B',
      dealType: 'new'
    });
    
    const enterpriseDeal3 = await this.createDeal({
      name: 'Microtech Systems - Secure Cloud Connection Service',
      value: 178500,
      category: 'fiber',
      stage: 'qualification',
      customerId: globalLogistics.id,
      userId: lisaWilliams.id,
      gpPercentage: 72,
      expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // 45 days from now
      region: 'Northeast',
      clientType: 'B2B',
      dealType: 'new'
    });
    
    // Carrier deals
    const carrierDeal1 = await this.createDeal({
      name: 'Northeast Telecom - Dark Fiber Network Expansion',
      value: 1250000,
      category: 'fiber',
      stage: 'closing',
      customerId: acmeCorp.id,
      userId: davidThompson.id,
      gpPercentage: 58,
      expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
      region: 'Northeast',
      clientType: 'carrier',
      dealType: 'expansion'
    });
    
    const carrierDeal2 = await this.createDeal({
      name: 'Pacific Mobile Carriers - Metro Area Network Upgrade',
      value: 875000,
      category: 'wireless',
      stage: 'negotiation',
      customerId: techSolutions.id,
      userId: davidThompson.id,
      gpPercentage: 61,
      expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28), // 28 days from now
      region: 'West',
      clientType: 'carrier',
      dealType: 'upgrade'
    });
    
    // Regional business deals
    const regionalDeal1 = await this.createDeal({
      name: 'Central Medical Center - Wireless Network Refresh',
      value: 145000,
      category: 'wireless',
      stage: 'proposal',
      customerId: globalLogistics.id,
      userId: michellePatel.id,
      gpPercentage: 63,
      expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22), // 22 days from now
      region: 'Central',
      clientType: 'regional',
      dealType: 'refresh'
    });
    
    const regionalDeal2 = await this.createDeal({
      name: 'Midwest Manufacturing Group - Fiber Connectivity Deployment',
      value: 215000,
      category: 'fiber',
      stage: 'qualification',
      customerId: acmeCorp.id,
      userId: michellePatel.id,
      gpPercentage: 67,
      expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35), // 35 days from now
      region: 'Central',
      clientType: 'regional',
      dealType: 'new'
    });
    
    // Channel partner deals
    const channelDeal1 = await this.createDeal({
      name: 'Southern Financial Network - Branch Office Connectivity',
      value: 325000,
      category: 'fiber',
      stage: 'discovery',
      customerId: techSolutions.id,
      userId: jamesMurphy.id,
      gpPercentage: 59,
      expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 50), // 50 days from now
      region: 'Southeast',
      clientType: 'B2B',
      dealType: 'new'
    });
    
    const channelDeal2 = await this.createDeal({
      name: 'Western Healthcare Association - Private 5G Network',
      value: 495000,
      category: 'wireless',
      stage: 'proposal',
      customerId: globalLogistics.id,
      userId: jamesMurphy.id,
      gpPercentage: 64,
      expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40), // 40 days from now
      region: 'West',
      clientType: 'B2B',
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
      userId: lisaWilliams.id,
      achievementId: salesStar.id
    });
    
    await this.awardAchievement({
      userId: davidThompson.id,
      achievementId: dealCloser.id
    });
    
    await this.awardAchievement({
      userId: robertGarcia.id,
      achievementId: fiberExpert.id
    });
    
    // Create real weekly sales targets with reviews
    // Enterprise team lead - quarterly and weekly targets
    await this.createTarget({
      userId: robertGarcia.id,
      targetType: 'revenue',
      period: 'quarterly',
      startDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1), // First day of current quarter
      endDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 0), // Last day of current quarter
      targetValue: 1500000, // $1.5M quarterly target
      currentValue: 675000  // $675K so far (45% to goal)
    });
    
    await this.createTarget({
      userId: robertGarcia.id,
      targetType: 'revenue',
      period: 'weekly',
      startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())), // First day of current week (Sunday)
      endDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6)), // Last day of current week (Saturday)
      targetValue: 115000, // $115K weekly target
      currentValue: 65000  // $65K so far (56% to goal)
    });
    
    // Enterprise Account Executive - quarterly and weekly targets
    await this.createTarget({
      userId: lisaWilliams.id,
      targetType: 'revenue',
      period: 'quarterly',
      startDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1), // First day of current quarter
      endDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 0), // Last day of current quarter
      targetValue: 750000, // $750K quarterly target
      currentValue: 410000  // $410K so far (55% to goal)
    });
    
    await this.createTarget({
      userId: lisaWilliams.id,
      targetType: 'revenue',
      period: 'weekly',
      startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())), // First day of current week (Sunday)
      endDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6)), // Last day of current week (Saturday)
      targetValue: 57700, // $57.7K weekly target
      currentValue: 23000  // $23K so far (40% to goal)
    });
    
    // Carrier Services Manager - quarterly and weekly targets
    await this.createTarget({
      userId: davidThompson.id,
      targetType: 'revenue',
      period: 'quarterly',
      startDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1), // First day of current quarter
      endDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 0), // Last day of current quarter
      targetValue: 2200000, // $2.2M quarterly target (carrier deals are larger)
      currentValue: 1450000  // $1.45M so far (66% to goal)
    });
    
    await this.createTarget({
      userId: davidThompson.id,
      targetType: 'revenue',
      period: 'weekly',
      startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())), // First day of current week (Sunday)
      endDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6)), // Last day of current week (Saturday)
      targetValue: 169000, // $169K weekly target
      currentValue: 135000  // $135K so far (80% to goal)
    });
    
    // Regional Sales Manager - quarterly and weekly targets
    await this.createTarget({
      userId: michellePatel.id,
      targetType: 'revenue',
      period: 'quarterly',
      startDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1), // First day of current quarter
      endDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 0), // Last day of current quarter
      targetValue: 850000, // $850K quarterly target
      currentValue: 325000  // $325K so far (38% to goal)
    });
    
    await this.createTarget({
      userId: michellePatel.id,
      targetType: 'revenue',
      period: 'weekly',
      startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())), // First day of current week (Sunday)
      endDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6)), // Last day of current week (Saturday)
      targetValue: 65000, // $65K weekly target
      currentValue: 42000  // $42K so far (65% to goal)
    });
    
    // Channel Partner Lead - quarterly and weekly targets
    await this.createTarget({
      userId: jamesMurphy.id,
      targetType: 'revenue',
      period: 'quarterly',
      startDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1), // First day of current quarter
      endDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 0), // Last day of current quarter
      targetValue: 1200000, // $1.2M quarterly target
      currentValue: 580000  // $580K so far (48% to goal)
    });
    
    await this.createTarget({
      userId: jamesMurphy.id,
      targetType: 'revenue',
      period: 'weekly',
      startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())), // First day of current week (Sunday)
      endDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6)), // Last day of current week (Saturday)
      targetValue: 92000, // $92K weekly target
      currentValue: 33000  // $33K so far (36% to goal)
    });
    
    // Create rewards
    const giftCardReward = await this.createReward({
      name: "$50 Amazon Gift Card",
      description: "Redeem your points for a $50 Amazon gift card",
      category: "gift_card",
      type: "digital",
      pointCost: 5000,
      isAvailable: true,
      image: "gift_card.png"
    });
    
    const premiumEquipment = await this.createReward({
      name: "Premium Sales Equipment",
      description: "Upgrade your sales toolkit with premium equipment",
      category: "equipment",
      type: "physical",
      pointCost: 10000,
      isAvailable: true,
      image: "equipment.png"
    });
    
    const trainingWorkshop = await this.createReward({
      name: "Advanced Sales Training Workshop",
      description: "Exclusive access to advanced sales techniques workshop",
      category: "training",
      type: "event",
      pointCost: 7500,
      isAvailable: true,
      image: "workshop.png"
    });
    
    // Create challenges focused on ISP sales
    const fiberSalesChallenge = await this.createChallenge({
      name: "Fiber Sales Sprint",
      description: "Close at least 3 fiber connectivity deals this month to earn 1,000 points",
      startDate: new Date(new Date().setDate(1)), // First day of current month
      endDate: new Date(new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0)), // Last day of current month
      category: "sales",
      criteria: { 
        type: "most_sales", 
        category: "fiber", 
        minSales: 3
      },
      status: "active",
      rewardPoints: 1000
    });
    
    const carrierDealChallenge = await this.createChallenge({
      name: "Carrier Deal Champion",
      description: "Close a carrier deal valued over $1M to earn 2,000 points",
      startDate: new Date(new Date().setDate(1)), // First day of current month
      endDate: new Date(new Date(new Date().setMonth(new Date().getMonth() + 2)).setDate(0)), // Last day of next month (2-month challenge)
      category: "sales",
      criteria: { 
        type: "deal_value", 
        clientType: "carrier", 
        minValue: 1000000
      },
      status: "active",
      rewardPoints: 2000
    });
    
    // Add participants to Fiber Sales challenge
    await this.joinChallenge({
      userId: robertGarcia.id,
      challengeId: fiberSalesChallenge.id,
      joinedAt: new Date(),
      progress: {
        currentSales: 2,
        targetSales: 3
      },
      status: "in_progress"
    });
    
    await this.joinChallenge({
      userId: lisaWilliams.id,
      challengeId: fiberSalesChallenge.id,
      joinedAt: new Date(),
      progress: {
        currentSales: 1,
        targetSales: 3
      },
      status: "in_progress"
    });
    
    await this.joinChallenge({
      userId: davidThompson.id,
      challengeId: fiberSalesChallenge.id,
      joinedAt: new Date(),
      progress: {
        currentSales: 3,
        targetSales: 3
      },
      status: "completed"
    });
    
    // Add participants to Carrier Deal challenge
    await this.joinChallenge({
      userId: davidThompson.id,
      challengeId: carrierDealChallenge.id,
      joinedAt: new Date(),
      progress: {
        currentValue: 875000,
        targetValue: 1000000
      },
      status: "in_progress"
    });
    
    await this.joinChallenge({
      userId: jamesMurphy.id, 
      challengeId: carrierDealChallenge.id,
      joinedAt: new Date(),
      progress: {
        currentValue: 0,
        targetValue: 1000000
      },
      status: "in_progress"
    });
    
    // Add points for users based on real sales performance
    await this.addPointTransaction({
      userId: robertGarcia.id,
      amount: 950,
      description: "Enterprise customer acquisition bonus",
      transactionType: "reward",
      referenceId: null,
      metadata: null
    });
    
    await this.addPointTransaction({
      userId: lisaWilliams.id,
      amount: 600,
      description: "Quarterly sales incentive",
      transactionType: "reward",
      referenceId: null,
      metadata: null
    });
    
    await this.addPointTransaction({
      userId: davidThompson.id,
      amount: 1250,
      description: "Carrier contract extension bonus",
      transactionType: "reward",
      referenceId: null,
      metadata: null
    });
    
    await this.addPointTransaction({
      userId: michellePatel.id,
      amount: 500,
      description: "Regional expansion incentive",
      transactionType: "reward",
      referenceId: null,
      metadata: null
    });
    
    // Award users with rewards
    await this.awardUserReward({
      userId: robertGarcia.id,
      rewardId: giftCardReward.id,
      awardedAt: new Date(),
      status: "pending",
      metadata: { email: "robert.garcia@ispcompany.com" }
    });
    
    await this.awardUserReward({
      userId: davidThompson.id,
      rewardId: trainingWorkshop.id,
      awardedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
      status: "redeemed",
      redeemedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      metadata: { email: "david.thompson@ispcompany.com" }
    });
  }
  
  // Rewards operations
  async getReward(id: number): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = this.rewardCounter++;
    const now = new Date();
    const reward: Reward = { ...insertReward, id, createdAt: now };
    this.rewards.set(id, reward);
    return reward;
  }

  async getRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }

  async getRewardsByCategory(category: string): Promise<Reward[]> {
    return Array.from(this.rewards.values())
      .filter(reward => reward.category === category);
  }

  async getRewardsByType(type: string): Promise<Reward[]> {
    return Array.from(this.rewards.values())
      .filter(reward => reward.type === type);
  }

  async getAvailableRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values())
      .filter(reward => reward.isAvailable);
  }

  // User rewards operations
  async getUserRewards(userId: number): Promise<UserReward[]> {
    return Array.from(this.userRewards.values())
      .filter(userReward => userReward.userId === userId)
      .sort((a, b) => {
        // Sort by awarded date, most recent first
        if (!a.awardedAt || !b.awardedAt) return 0;
        return b.awardedAt.getTime() - a.awardedAt.getTime();
      });
  }

  async awardUserReward(insertUserReward: InsertUserReward): Promise<UserReward> {
    const id = this.userRewardCounter++;
    const now = new Date();
    const userReward: UserReward = { 
      ...insertUserReward, 
      id, 
      awardedAt: insertUserReward.awardedAt || now,
      status: insertUserReward.status || 'pending'
    };
    this.userRewards.set(id, userReward);
    
    // Create an activity for this reward
    const reward = await this.getReward(userReward.rewardId);
    if (reward) {
      await this.createActivity({
        userId: userReward.userId,
        type: 'reward_earned',
        content: `Reward earned: ${reward.name}`,
        relatedId: reward.id,
        metadata: { rewardName: reward.name, rewardImage: reward.image }
      });
    }
    
    return userReward;
  }

  async updateUserRewardStatus(id: number, status: string): Promise<UserReward | undefined> {
    const userReward = this.userRewards.get(id);
    if (!userReward) return undefined;
    
    const updatedUserReward = { 
      ...userReward, 
      status
    };
    this.userRewards.set(id, updatedUserReward);
    
    // Create an activity for status change
    if (status === 'redeemed') {
      const reward = await this.getReward(userReward.rewardId);
      if (reward) {
        await this.createActivity({
          userId: userReward.userId,
          type: 'reward_redeemed',
          content: `Reward redeemed: ${reward.name}`,
          relatedId: reward.id,
          metadata: { rewardName: reward.name, rewardImage: reward.image }
        });
      }
    }
    
    return updatedUserReward;
  }

  // Points operations
  async getUserPoints(userId: number): Promise<number> {
    const transactions = Array.from(this.pointTransactions.values())
      .filter(transaction => transaction.userId === userId);
    
    // Sum up all the transactions
    return transactions.reduce((total, transaction) => {
      // Add points for earned transactions, subtract for spent
      if (transaction.transactionType === 'reward' || transaction.transactionType === 'bonus') {
        return total + transaction.amount;
      } else if (transaction.transactionType === 'redemption') {
        return total - transaction.amount;
      }
      return total;
    }, 0);
  }

  async addPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction> {
    const id = this.pointTransactionCounter++;
    const now = new Date();
    const pointTransaction: PointTransaction = { 
      ...transaction, 
      id, 
      createdAt: now 
    };
    this.pointTransactions.set(id, pointTransaction);
    
    // Create an activity for this point transaction
    await this.createActivity({
      userId: transaction.userId,
      type: 'points_transaction',
      content: transaction.transactionType === 'redemption' 
        ? `Points spent: ${transaction.amount} - ${transaction.description}`
        : `Points earned: ${transaction.amount} - ${transaction.description}`,
      relatedId: null,
      metadata: { 
        amount: transaction.amount, 
        type: transaction.transactionType,
        description: transaction.description
      }
    });
    
    return pointTransaction;
  }

  async getPointTransactions(userId: number): Promise<PointTransaction[]> {
    return Array.from(this.pointTransactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => {
        // Sort by created date, most recent first
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  // Challenge operations
  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeCounter++;
    const now = new Date();
    const challenge: Challenge = { 
      ...insertChallenge, 
      id, 
      createdAt: now 
    };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async getChallenges(active?: boolean): Promise<Challenge[]> {
    let challenges = Array.from(this.challenges.values());
    
    if (active !== undefined) {
      const now = new Date();
      challenges = challenges.filter(challenge => {
        const isActive = challenge.status === 'active' &&
                        challenge.startDate <= now &&
                        challenge.endDate >= now;
        return active ? isActive : !isActive;
      });
    }
    
    return challenges;
  }

  async updateChallenge(id: number, challengeData: Partial<Challenge>): Promise<Challenge | undefined> {
    const challenge = this.challenges.get(id);
    if (!challenge) return undefined;
    
    const updatedChallenge = { ...challenge, ...challengeData };
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }

  // Challenge participant operations
  async joinChallenge(participant: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    const id = this.challengeParticipantCounter++;
    const now = new Date();
    const challengeParticipant: ChallengeParticipant = { 
      ...participant, 
      id, 
      joinedAt: participant.joinedAt || now,
      status: participant.status || 'in_progress'
    };
    this.challengeParticipants.set(id, challengeParticipant);
    
    // Create an activity for joining the challenge
    const challenge = await this.getChallenge(participant.challengeId);
    if (challenge) {
      await this.createActivity({
        userId: participant.userId,
        type: 'challenge_joined',
        content: `Joined challenge: ${challenge.name}`,
        relatedId: challenge.id,
        metadata: { challengeName: challenge.name, challengeCategory: challenge.category }
      });
    }
    
    return challengeParticipant;
  }

  async getParticipantsByChallenge(challengeId: number): Promise<ChallengeParticipant[]> {
    return Array.from(this.challengeParticipants.values())
      .filter(participant => participant.challengeId === challengeId);
  }

  async getUserChallenges(userId: number): Promise<{challenge: Challenge, participant: ChallengeParticipant}[]> {
    const userParticipants = Array.from(this.challengeParticipants.values())
      .filter(participant => participant.userId === userId);
    
    const result = [];
    for (const participant of userParticipants) {
      const challenge = this.challenges.get(participant.challengeId);
      if (challenge) {
        result.push({
          challenge,
          participant
        });
      }
    }
    
    return result;
  }

  async updateChallengeParticipant(id: number, participantData: Partial<ChallengeParticipant>): Promise<ChallengeParticipant | undefined> {
    const participant = this.challengeParticipants.get(id);
    if (!participant) return undefined;
    
    const updatedParticipant = { ...participant, ...participantData };
    this.challengeParticipants.set(id, updatedParticipant);
    
    // If status changed to completed, create activity and award points
    if (participantData.status === 'completed' && participant.status !== 'completed') {
      const challenge = await this.getChallenge(participant.challengeId);
      if (challenge) {
        // Create activity
        await this.createActivity({
          userId: participant.userId,
          type: 'challenge_completed',
          content: `Completed challenge: ${challenge.name}`,
          relatedId: challenge.id,
          metadata: { challengeName: challenge.name, rewardPoints: challenge.rewardPoints }
        });
        
        // Award points
        if (challenge.rewardPoints) {
          await this.addPointTransaction({
            userId: participant.userId,
            amount: challenge.rewardPoints,
            description: `Completed challenge: ${challenge.name}`,
            transactionType: 'reward',
            referenceId: challenge.id,
            metadata: { challengeName: challenge.name }
          });
        }
      }
    }
    
    return updatedParticipant;
  }

  // Gamification data methods
  async getRewardsAndIncentivesData(userId?: number): Promise<any> {
    let userPoints = 0;
    let userRecentTransactions = [];
    let userAvailableRewards = [];
    let userRewards = [];
    let userChallenges = [];
    
    // Get data for specific user if userId is provided
    if (userId) {
      userPoints = await this.getUserPoints(userId);
      userRecentTransactions = await this.getPointTransactions(userId);
      userRewards = await this.getUserRewards(userId);
      userChallenges = await this.getUserChallenges(userId);
    }
    
    // Always get available rewards
    const availableRewards = await this.getAvailableRewards();
    
    // Get active challenges
    const activeChallenges = await this.getChallenges(true);
    
    // For a specific user, filter rewards they can afford
    if (userId) {
      userAvailableRewards = availableRewards.filter(reward => 
        reward.pointCost <= userPoints
      );
    }
    
    return {
      userPoints,
      userRecentTransactions: userRecentTransactions.slice(0, 5), // Get only 5 most recent transactions
      availableRewards,
      userAvailableRewards,
      userRewards,
      activeChallenges,
      userChallenges,
      
      // Overview stats (for dashboard)
      totalRewards: this.rewards.size,
      totalActiveChallenges: activeChallenges.length,
      totalRedeemed: Array.from(this.userRewards.values())
        .filter(reward => reward.status === 'redeemed').length,
      
      // Rewards by category
      rewardsByCategory: {
        gift_card: availableRewards.filter(r => r.category === 'gift_card').length,
        equipment: availableRewards.filter(r => r.category === 'equipment').length,
        training: availableRewards.filter(r => r.category === 'training').length,
        travel: availableRewards.filter(r => r.category === 'travel').length,
        other: availableRewards.filter(r => !['gift_card', 'equipment', 'training', 'travel'].includes(r.category)).length
      }
    };
  }
}

export const storage = new MemStorage();

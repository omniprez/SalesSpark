import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Team, InsertUser, InsertTeam, InsertTarget, Target
} from '@shared/schema';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Edit, Trash2, ArrowUpDown } from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('sales-reps');
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="sales-reps" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="sales-reps">Sales Representatives</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="targets">Sales Targets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales-reps">
          <SalesRepSection />
        </TabsContent>
        
        <TabsContent value="teams">
          <TeamsSection />
        </TabsContent>
        
        <TabsContent value="targets">
          <TargetsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sales Representatives Section
function SalesRepSection() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'sales_rep',
    teamId: null as number | null,
    isChannelPartner: false,
    avatar: ''
  });
  
  const { toast } = useToast();
  
  // Fetch users data
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
  });
  
  // Fetch teams for dropdown
  const { data: teams } = useQuery<Team[]>({ 
    queryKey: ['/api/teams'],
  });
  
  // Create/update user mutation
  const mutation = useMutation({
    mutationFn: async (userData: Partial<InsertUser> & { id?: number }) => {
      const { id, ...restData } = userData;
      if (id) {
        // Update existing user
        return apiRequest('PATCH', `/api/users/${id}`, restData);
      } else {
        // Create new user
        return apiRequest('POST', '/api/users', restData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: `${editingUser ? 'Updated' : 'Created'} sales representative`,
        description: `Successfully ${editingUser ? 'updated' : 'created'} sales representative.`,
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: `Failed to ${editingUser ? 'update' : 'create'} sales representative`,
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('DELETE', `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'Deleted sales representative',
        description: 'Successfully deleted sales representative.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete sales representative',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '', // Don't show existing password
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        isChannelPartner: user.isChannelPartner || false,
        avatar: user.avatar || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'sales_rep',
        teamId: null,
        isChannelPartner: false,
        avatar: ''
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'teamId') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value ? parseInt(value) : null 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = {
      ...formData,
      ...(editingUser && { id: editingUser.id }),
    };
    
    // Only include password if it's set (for updates)
    if (!userData.password && editingUser) {
      const { password, ...restData } = userData;
      mutation.mutate(restData);
    } else {
      mutation.mutate(userData);
    }
  };
  
  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this sales representative?')) {
      deleteMutation.mutate(userId);
    }
  };
  
  const getTeamName = (teamId: number | null) => {
    if (!teamId || !teams) return 'No Team';
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sales Representatives</CardTitle>
          <CardDescription>Manage your sales team and representatives</CardDescription>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Sales Rep
        </Button>
      </CardHeader>
      <CardContent>
        {usersLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role === 'admin' 
                        ? 'Administrator' 
                        : user.role === 'manager' 
                          ? 'Manager' 
                          : 'Sales Rep'}
                    </TableCell>
                    <TableCell>{getTeamName(user.teamId)}</TableCell>
                    <TableCell>
                      {user.isChannelPartner ? 'Channel Partner' : 'Internal'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No sales representatives found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit' : 'Add'} Sales Representative</DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Update the information for this sales representative.' 
                  : 'Add a new sales representative to your team.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required={!editingUser}
                    placeholder={editingUser ? '(unchanged)' : ''}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select 
                    name="role" 
                    value={formData.role} 
                    onValueChange={(value) => handleSelectChange('role', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="sales_rep">Sales Representative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="teamId" className="text-right">
                    Team
                  </Label>
                  <Select 
                    name="teamId" 
                    value={formData.teamId?.toString() || ''} 
                    onValueChange={(value) => handleSelectChange('teamId', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Team</SelectItem>
                      {teams?.map(team => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isChannelPartner" className="text-right">
                    Type
                  </Label>
                  <Select 
                    name="isChannelPartner" 
                    value={formData.isChannelPartner ? 'true' : 'false'} 
                    onValueChange={(value) => handleSelectChange('isChannelPartner', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Internal</SelectItem>
                      <SelectItem value="true">Channel Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="avatar" className="text-right">
                    Avatar URL
                  </Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    value={formData.avatar || ''}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="(optional)"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingUser ? 'Update' : 'Add'} Rep
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Teams Section
function TeamsSection() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    type: 'internal'
  });
  
  const { toast } = useToast();
  
  // Fetch teams data
  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({ 
    queryKey: ['/api/teams'],
  });
  
  // Create/update team mutation
  const mutation = useMutation({
    mutationFn: async (teamData: Partial<InsertTeam> & { id?: number }) => {
      const { id, ...restData } = teamData;
      if (id) {
        // Update existing team
        return apiRequest('PATCH', `/api/teams/${id}`, restData);
      } else {
        // Create new team
        return apiRequest('POST', '/api/teams', restData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: `${editingTeam ? 'Updated' : 'Created'} team`,
        description: `Successfully ${editingTeam ? 'updated' : 'created'} team.`,
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: `Failed to ${editingTeam ? 'update' : 'create'} team`,
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Delete team mutation
  const deleteMutation = useMutation({
    mutationFn: async (teamId: number) => {
      return apiRequest('DELETE', `/api/teams/${teamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: 'Deleted team',
        description: 'Successfully deleted team.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete team',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        region: team.region || '',
        type: team.type
      });
    } else {
      setEditingTeam(null);
      setFormData({
        name: '',
        region: '',
        type: 'internal'
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTeam(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teamData = {
      ...formData,
      ...(editingTeam && { id: editingTeam.id }),
    };
    mutation.mutate(teamData);
  };
  
  const handleDeleteTeam = (teamId: number) => {
    if (confirm('Are you sure you want to delete this team?')) {
      deleteMutation.mutate(teamId);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Teams</CardTitle>
          <CardDescription>Manage your sales teams and regional divisions</CardDescription>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Team
        </Button>
      </CardHeader>
      <CardContent>
        {teamsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams && teams.length > 0 ? (
                teams.map(team => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>{team.region || 'Global'}</TableCell>
                    <TableCell>
                      {team.type === 'internal' ? 'Internal' : 'Channel Partner'}
                    </TableCell>
                    <TableCell>
                      {team.createdAt 
                        ? new Date(team.createdAt).toLocaleDateString() 
                        : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(team)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTeam(team.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No teams found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Edit' : 'Add'} Team</DialogTitle>
              <DialogDescription>
                {editingTeam 
                  ? 'Update the information for this team.' 
                  : 'Add a new sales team to your organization.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Team Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="region" className="text-right">
                    Region
                  </Label>
                  <Input
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="(optional)"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Team Type
                  </Label>
                  <Select 
                    name="type" 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select team type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="channel_partner">Channel Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingTeam ? 'Update' : 'Add'} Team
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Sales Targets Section
function TargetsSection() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [formData, setFormData] = useState({
    userId: 0,
    targetType: 'revenue',
    period: 'monthly',
    startDate: '',
    endDate: '',
    targetValue: 0,
    currentValue: 0
  });
  
  const { toast } = useToast();
  
  // Fetch targets data
  const { data: targets, isLoading: targetsLoading } = useQuery<Target[]>({ 
    queryKey: ['/api/targets'],
  });
  
  // Fetch users for dropdown
  const { data: users } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
  });
  
  // Create/update target mutation
  const mutation = useMutation({
    mutationFn: async (targetData: Partial<InsertTarget> & { id?: number }) => {
      const { id, ...restData } = targetData;
      if (id) {
        // Update existing target
        return apiRequest('PATCH', `/api/targets/${id}`, restData);
      } else {
        // Create new target
        return apiRequest('POST', '/api/targets', restData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
      toast({
        title: `${editingTarget ? 'Updated' : 'Created'} sales target`,
        description: `Successfully ${editingTarget ? 'updated' : 'created'} sales target.`,
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: `Failed to ${editingTarget ? 'update' : 'create'} sales target`,
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Delete target mutation
  const deleteMutation = useMutation({
    mutationFn: async (targetId: number) => {
      return apiRequest('DELETE', `/api/targets/${targetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/targets'] });
      toast({
        title: 'Deleted sales target',
        description: 'Successfully deleted sales target.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete sales target',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const handleOpenDialog = (target?: Target) => {
    if (target) {
      setEditingTarget(target);
      setFormData({
        userId: target.userId,
        targetType: target.targetType,
        period: target.period,
        startDate: new Date(target.startDate).toISOString().split('T')[0],
        endDate: new Date(target.endDate).toISOString().split('T')[0],
        targetValue: target.targetValue,
        currentValue: target.currentValue || 0
      });
    } else {
      setEditingTarget(null);
      // Set default dates to current month
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString().split('T')[0];
      
      setFormData({
        userId: users && users.length > 0 ? users[0].id : 0,
        targetType: 'revenue',
        period: 'monthly',
        startDate: firstDay,
        endDate: lastDay,
        targetValue: 0,
        currentValue: 0
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTarget(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'userId') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetData = {
      ...formData,
      ...(editingTarget && { id: editingTarget.id }),
    };
    mutation.mutate(targetData);
  };
  
  const handleDeleteTarget = (targetId: number) => {
    if (confirm('Are you sure you want to delete this sales target?')) {
      deleteMutation.mutate(targetId);
    }
  };
  
  const getUserName = (userId: number) => {
    if (!users) return 'Unknown User';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sales Targets</CardTitle>
          <CardDescription>Manage performance targets for your sales representatives</CardDescription>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Target
        </Button>
      </CardHeader>
      <CardContent>
        {targetsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Target Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {targets && targets.length > 0 ? (
                targets.map(target => {
                  const progress = target.currentValue !== null 
                    ? Math.min(100, (target.currentValue / target.targetValue) * 100) 
                    : 0;
                  
                  return (
                    <TableRow key={target.id}>
                      <TableCell className="font-medium">{getUserName(target.userId)}</TableCell>
                      <TableCell className="capitalize">
                        {target.targetType === 'revenue' ? 'Revenue' : 
                         target.targetType === 'deals' ? 'Deals Closed' : 
                         target.targetType === 'gp' ? 'Gross Profit' : target.targetType}
                      </TableCell>
                      <TableCell className="capitalize">{target.period}</TableCell>
                      <TableCell>
                        {new Date(target.startDate).toLocaleDateString()} to {new Date(target.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {target.targetType === 'deals' 
                          ? target.targetValue 
                          : formatCurrency(target.targetValue)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {target.targetType === 'deals'
                            ? `${target.currentValue || 0} of ${target.targetValue}`
                            : `${formatCurrency(target.currentValue || 0)} of ${formatCurrency(target.targetValue)}`}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(target)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTarget(target.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No sales targets found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTarget ? 'Edit' : 'Add'} Sales Target</DialogTitle>
              <DialogDescription>
                {editingTarget 
                  ? 'Update the sales target information.' 
                  : 'Set a new performance target for a sales representative.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="userId" className="text-right">
                    Sales Rep
                  </Label>
                  <Select 
                    name="userId" 
                    value={formData.userId.toString()} 
                    onValueChange={(value) => handleSelectChange('userId', value)}
                    disabled={!!editingTarget}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select sales rep" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="targetType" className="text-right">
                    Target Type
                  </Label>
                  <Select 
                    name="targetType" 
                    value={formData.targetType} 
                    onValueChange={(value) => handleSelectChange('targetType', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select target type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="deals">Number of Deals</SelectItem>
                      <SelectItem value="gp">Gross Profit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="period" className="text-right">
                    Period
                  </Label>
                  <Select 
                    name="period" 
                    value={formData.period} 
                    onValueChange={(value) => handleSelectChange('period', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="targetValue" className="text-right">
                    Target Value
                  </Label>
                  <Input
                    id="targetValue"
                    name="targetValue"
                    type="number"
                    value={formData.targetValue}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                    min="0"
                    step={formData.targetType === 'deals' ? '1' : '0.01'}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currentValue" className="text-right">
                    Current Value
                  </Label>
                  <Input
                    id="currentValue"
                    name="currentValue"
                    type="number"
                    value={formData.currentValue}
                    onChange={handleInputChange}
                    className="col-span-3"
                    min="0"
                    step={formData.targetType === 'deals' ? '1' : '0.01'}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingTarget ? 'Update' : 'Add'} Target
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
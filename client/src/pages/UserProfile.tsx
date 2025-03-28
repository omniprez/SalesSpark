import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Settings, 
  BadgeCheck, 
  UserCog, 
  FileQuestion, 
  Loader2, 
  Save
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';

// Define the form schema with Zod
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  avatar: z.string().optional(),
  teamId: z.number().optional(),
  isChannelPartner: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const UserProfile = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState<number | null>(null);
  
  // Fetch current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery<any>({
    queryKey: ['/api/me']
  });
  
  // Set user ID when data is loaded
  useEffect(() => {
    if (currentUser && currentUser.id) {
      setUserId(currentUser.id);
    }
  }, [currentUser]);
  
  // Handle error case
  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please log in to view your profile.",
        variant: "destructive",
      });
      setLocation("/login");
    }
  }, [isLoadingUser, currentUser, toast, setLocation]);
  
  // Fetch teams for the dropdown
  const { data: teams = [] } = useQuery<any[]>({
    queryKey: ['/api/teams'],
    enabled: !!userId,
  });
  
  // Setup the form with default values from current user
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      avatar: "",
      teamId: undefined,
      isChannelPartner: false,
    },
  });
  
  // Update form values when user data is loaded
  useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name || "",
        email: currentUser.email || "",
        avatar: currentUser.avatar || "",
        teamId: currentUser.teamId,
        isChannelPartner: currentUser.isChannelPartner || false,
      });
    }
  }, [currentUser, form]);
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!userId) throw new Error("User ID not found");
      const response = await apiRequest('PATCH', `/api/users/${userId}/profile`, values);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
        <p className="text-muted-foreground mb-4">Unable to load user profile information.</p>
        <Button onClick={() => setLocation("/login")}>Go to Login</Button>
      </div>
    );
  }
  
  return (
    <div className="container max-w-screen-lg mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <User className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">User Profile</h1>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center">
            <UserCog className="h-4 w-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" /> Account Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how others see you on the platform.
              </CardDescription>
            </CardHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 flex flex-col items-center justify-start">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={form.getValues("avatar") || undefined} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <FormField
                        control={form.control}
                        name="avatar"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Profile Picture URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/avatar.jpg" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter a URL for your profile picture
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="md:w-2/3 space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="teamId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team</FormLabel>
                            <FormControl>
                              <Select 
                                value={field.value?.toString()} 
                                onValueChange={(value) => field.onChange(Number(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a team" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No Team</SelectItem>
                                  {teams?.map((team: any) => (
                                    <SelectItem key={team.id} value={team.id.toString()}>
                                      {team.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isChannelPartner"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Channel Partner</FormLabel>
                              <FormDescription>
                                Identify as an external channel partner rather than internal sales.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="flex items-center gap-2"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-primary" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium capitalize">{currentUser.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username</span>
                  <span className="font-medium">{currentUser.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Created</span>
                  <span className="font-medium">
                    {currentUser.createdAt 
                      ? new Date(currentUser.createdAt).toLocaleDateString() 
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Account settings will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
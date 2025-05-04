import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Upload, Share2, Copy, MessageSquare } from 'lucide-react';
import { Redirect } from 'wouter';
import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfileSettingsPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    medicalYear: user?.medicalYear || '',
    collegeName: user?.collegeName || '',
  });

  // Mock data - replace with real API data
  const stats = {
    totalQuizzes: 45,
    averageScore: 78,
    bestScore: 95,
    recentActivity: [
      { type: 'quiz', title: 'Anatomy Quiz', score: 85, date: '2024-01-20' },
      { type: 'case', title: 'Cardiology Case Study', date: '2024-01-19' },
      { type: 'note', title: 'Pharmacology Notes', date: '2024-01-18' },
    ],
    performanceData: [
      { date: '2024-01-15', score: 75 },
      { date: '2024-01-16', score: 82 },
      { date: '2024-01-17', score: 78 },
      { date: '2024-01-18', score: 85 },
      { date: '2024-01-19', score: 90 },
    ],
  };

  const referralInfo = {
    code: 'DRNXT123',
    totalInvites: 5,
    rewardsEarned: 500,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await fetch('/api/user/upload-avatar', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload image');

        toast({
          title: "Success",
          description: "Profile picture updated successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update profile picture",
          variant: "destructive"
        });
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await fetch('/api/user/profile/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
    setUpdating(false);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://drnxt.com/refer/${referralInfo.code}`);
    toast({
      title: "Success",
      description: "Referral link copied to clipboard"
    });
  };

  return (
    <AppLayout
      title="Profile Settings"
      description="Manage your profile and view your progress"
    >
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="stats">Performance</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback>{user.fullName?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer">
                      <Upload className="h-4 w-4 text-white" />
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                  <div>
                    <CardTitle>{user.fullName}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Enter your email"
                        />
                        {user?.emailVerified ? (
                          <Badge variant="success" className="mt-2">Verified</Badge>
                        ) : (
                          <Button variant="outline" size="sm" className="mt-2">
                            Verify Email
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="Enter your phone number"
                        />
                        {user?.phoneVerified ? (
                          <Badge variant="success" className="mt-2">Verified</Badge>
                        ) : (
                          <Button variant="outline" size="sm" className="mt-2">
                            Verify Phone
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Medical Year/Batch</Label>
                      <Select 
                        value={formData.medicalYear}
                        onValueChange={(value) => setFormData({...formData, medicalYear: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st_year">1st Year MBBS</SelectItem>
                          <SelectItem value="2nd_year">2nd Year MBBS</SelectItem>
                          <SelectItem value="3rd_year">3rd Year MBBS</SelectItem>
                          <SelectItem value="final_year">Final Year MBBS</SelectItem>
                          <SelectItem value="intern">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Medical College Name</Label>
                      <Input
                        value={formData.collegeName}
                        onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
                        placeholder="Enter your medical college name"
                      />
                    </div>
                    <div className="pt-2">
                      <Button type="submit" disabled={updating}>
                        {updating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Profile'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium">{user.subscriptionStatus || 'Free'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plan Expires:</span>
                      <span className="font-medium">
                        {user.planExpiryDate ? new Date(user.planExpiryDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Joined Date:</span>
                      <span className="font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Quizzes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalQuizzes}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.averageScore}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Best Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.bestScore}%</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </div>
                        {activity.score && (
                          <div className="text-primary font-medium">{activity.score}%</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Refer Friends</CardTitle>
                  <CardDescription>
                    Share DRNXT Learning with your friends and earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-2">Your Referral Code</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-background rounded">
                          {referralInfo.code}
                        </code>
                        <Button variant="outline" size="sm" onClick={copyReferralLink}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Link
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="pt-4 space-y-4">
                      <div className="flex justify-between">
                        <span>Total Invites</span>
                        <span className="font-medium">{referralInfo.totalInvites}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rewards Earned</span>
                        <span className="font-medium">₹{referralInfo.rewardsEarned}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
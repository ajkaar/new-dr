
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Redirect } from 'wouter';
import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function ProfileSettingsPage() {
  const { user, isLoading, updateProfile } = useAuth();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    dateOfBirth: user?.dateOfBirth || '',
    college: user?.college || '',
    yearOfStudy: user?.yearOfStudy || '',
    specialization: user?.specialization || '',
    state: user?.state || '',
    city: user?.city || '',
    bio: user?.bio || ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
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

  return (
    <AppLayout
      title="Profile Settings"
      description="Manage your profile and account settings"
    >
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>College</Label>
                      <Input
                        value={formData.college}
                        onChange={(e) => setFormData({...formData, college: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year of Study</Label>
                      <Input
                        type="number"
                        value={formData.yearOfStudy}
                        onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      <Input
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
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
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile</Label>
                    <Input
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subscription Status</Label>
                    <Input value={user.subscriptionStatus} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

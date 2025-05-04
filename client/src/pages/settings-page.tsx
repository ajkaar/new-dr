import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Moon, Sun, Languages, Bell, Shield, HelpCircle, Info, Mail, MessageCircle, Book, FileQuestion, Video, Bug, FileWarning, MessageSquare } from 'lucide-react';
import { Redirect } from 'wouter';
import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    newCase: true,
    newsUpdates: true,
    studyPlan: true,
    subscription: true,
  });

  const [appSettings, setAppSettings] = useState({
    theme: 'light',
    language: 'english',
    textSize: 'medium',
  });

  const [privacySettings, setPrivacySettings] = useState({
    shareData: true,
    analytics: true,
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    try {
      // API call to change password
      toast({
        title: "Success",
        description: "Password updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      });
    }
  };

  const handleDataDownload = async () => {
    try {
      // API call to download user data
      toast({
        title: "Success",
        description: "Your data will be emailed to you"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process data download",
        variant: "destructive"
      });
    }
  };

  return (
    <AppLayout
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Tabs defaultValue="account">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="app">App Settings</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                  <Button type="submit">Update Password</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Google Account</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.googleConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                  <Button variant="outline">
                    {user.googleConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-destructive">Deactivate Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable your account
                    </p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => setIsDeactivateOpen(true)}
                  >
                    Deactivate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label>New Case Available</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new cases are added
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newCase}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, newCase: checked})}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label>News Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive medical news and updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newsUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, newsUpdates: checked})}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label>Study Plan Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminded about your study schedule
                      </p>
                    </div>
                    <Switch
                      checked={notifications.studyPlan}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, studyPlan: checked})}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label>Subscription Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about subscription status
                      </p>
                    </div>
                    <Switch
                      checked={notifications.subscription}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, subscription: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="app" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={appSettings.theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setAppSettings({...appSettings, theme: 'light'})}
                      className="w-full"
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={appSettings.theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setAppSettings({...appSettings, theme: 'dark'})}
                      className="w-full"
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <RadioGroup
                    value={appSettings.language}
                    onValueChange={(value) => 
                      setAppSettings({...appSettings, language: value})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="english" id="english" />
                      <Label htmlFor="english">English</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hindi" id="hindi" disabled />
                      <Label htmlFor="hindi" className="text-muted-foreground">
                        Hindi (Coming Soon)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Text Size</Label>
                  <RadioGroup
                    value={appSettings.textSize}
                    onValueChange={(value) => 
                      setAppSettings({...appSettings, textSize: value})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="small" />
                      <Label htmlFor="small">Small</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="large" />
                      <Label htmlFor="large">Large</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label>Share Usage Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Help us improve by sharing anonymous usage data
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.shareData}
                      onCheckedChange={(checked) => 
                        setPrivacySettings({...privacySettings, shareData: checked})}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label>Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow analytics to improve your experience
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.analytics}
                      onCheckedChange={(checked) => 
                        setPrivacySettings({...privacySettings, analytics: checked})}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleDataDownload}
                  >
                    Download My Data
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    Delete Account & Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <HelpCircle className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">Contact Support</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get help from our dedicated support team. Available 24/7 for premium users.
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Support
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Live Chat (Premium)
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Info className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">FAQs/Help Center</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Browse through common questions and detailed guides about using DRNXT Learning.
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Book className="mr-2 h-4 w-4" />
                        User Guide
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileQuestion className="mr-2 h-4 w-4" />
                        Common Questions
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Video className="mr-2 h-4 w-4" />
                        Video Tutorials
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Shield className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">Report an Issue</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Report technical problems, content errors, or provide feedback.
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Bug className="mr-2 h-4 w-4" />
                        Technical Issue
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileWarning className="mr-2 h-4 w-4" />
                        Content Error
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Feature Request
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About DRNXT Learning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Version</h3>
                  <p className="text-sm text-muted-foreground">1.0.0</p>
                </div>
                <div className="space-y-4 pt-4">
                  <Button variant="outline" className="w-full">
                    Terms & Conditions
                  </Button>
                  <Button variant="outline" className="w-full">
                    Privacy Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AlertDialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
              <AlertDialogDescription>
                Your account will be temporarily disabled. You can reactivate it at any time by logging in.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Deactivate</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account & Data</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground">
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
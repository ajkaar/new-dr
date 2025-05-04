import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/toast';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@nextui-org/react';
//import other necessary imports


interface User {
  id: number;
  username: string;
  email: string;
  tokenLimit: number;
  subscriptionStatus: string;
}

export default function AdminPanelPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationContent, setNotificationContent] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    }
  };

  const handleTokenLimitChange = async (userId: number, tokenLimit: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenLimit: parseInt(tokenLimit) })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Token limit updated" });
        fetchUsers();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update token limit", variant: "destructive" });
    }
  };

  const handleSubscriptionChange = async (userId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionStatus: status })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Subscription status updated" });
        fetchUsers();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update subscription", variant: "destructive" });
    }
  };

  const handleSaveChanges = async (userId: number) => {
    // Add logic to save changes here.  This would likely involve another fetch call.
  };


  if (isLoading) return <p>Loading...</p>;

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        {/* Existing Admin Panel Content */}
        <Card>
          <CardHeader>
            <CardTitle>Ads Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ... existing ads settings */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ... existing notification settings */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Username</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Token Limit</th>
                    <th className="text-left p-2">Subscription</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-2">{user.username}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={user.tokenLimit}
                          onChange={(e) => handleTokenLimitChange(user.id, e.target.value)}
                          className="w-32"
                        />
                      </td>
                      <td className="p-2">
                        <Select
                          value={user.subscriptionStatus}
                          onValueChange={(value) => handleSubscriptionChange(user.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free_trial">Free Trial</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Button
                          onClick={() => handleSaveChanges(user.id)}
                          size="sm"
                        >
                          Save
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
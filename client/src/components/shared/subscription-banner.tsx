import React from 'react';
import { Crown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const SubscriptionBanner: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const tokenPercentage = Math.min(
    Math.round((user.tokenUsage / user.tokenLimit) * 100), 
    100
  );
  
  return (
    <div className="bg-primary-50 rounded-lg p-4">
      <div className="flex items-center">
        <Crown className="h-5 w-5 text-yellow-500" />
        <h3 className="ml-2 text-sm font-medium text-primary-800">
          {user.subscriptionStatus === 'free_trial' ? 'Free Trial' : 'Premium'}
        </h3>
      </div>
      <p className="text-xs text-primary-700 mt-2">
        You have used {user.tokenUsage.toLocaleString()}/{user.tokenLimit.toLocaleString()} tokens.
      </p>
      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-2 bg-primary rounded-full" 
          style={{ width: `${tokenPercentage}%` }}
        ></div>
      </div>
      {user.subscriptionStatus === 'free_trial' && (
        <Button 
          variant="default" 
          size="sm" 
          className="mt-3 w-full"
        >
          Upgrade Now
        </Button>
      )}
    </div>
  );
};

export default SubscriptionBanner;

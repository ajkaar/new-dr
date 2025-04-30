import React, { useState } from 'react';
import AppLayout from '@/components/layouts/app-layout';
import ChatInterface from '@/components/chatbot/chat-interface';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { queryClient } from '@/lib/queryClient';

const AiChatPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>('general');
  
  // Get token usage from user data
  const { data: userData } = useQuery({
    queryKey: ['/api/user'],
    enabled: !!user,
  });
  
  const tokenUsage = userData?.tokenUsage || user?.tokenUsage || 0;
  const tokenLimit = userData?.tokenLimit || user?.tokenLimit || 20000;
  
  const handleTokenUsageUpdate = (newUsage: number) => {
    if (userData) {
      // Update the cached user data with new token usage
      queryClient.setQueryData(['/api/user'], {
        ...userData,
        tokenUsage: newUsage
      });
    }
  };
  
  // Choose appropriate system message based on the selected subject
  const getSystemMessage = (): string => {
    switch (selectedSubject) {
      case 'anatomy':
        return 'Ask me anything about anatomy. I can help with structures, relationships, and clinical correlations.';
      case 'physiology':
        return 'I can answer your questions about human physiology, from cellular mechanisms to organ systems.';
      case 'pathology':
        return 'Ask about disease mechanisms, morphological changes, and clinical manifestations.';
      case 'pharmacology':
        return 'I can provide information about drugs, their mechanisms, uses, and side effects.';
      case 'medicine':
        return 'Ask me about internal medicine topics, diagnoses, and management approaches.';
      case 'surgery':
        return 'I can assist with surgical principles, procedures, and post-operative care.';
      default:
        return 'Ask me any medical question, and I\'ll try to help! I\'m your AI medical assistant powered by GPT-4o.';
    }
  };

  return (
    <AppLayout 
      title="AI Medical Chatbot" 
      description="Ask any medical question and get accurate, referenced answers from our AI assistant."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <ChatInterface 
            systemMessage={getSystemMessage()}
            placeholder={`Ask anything about ${selectedSubject === 'general' ? 'medicine' : selectedSubject}...`}
            onTokenUsageUpdate={handleTokenUsageUpdate}
          />
        </div>
        
        <div className="space-y-6">
          {/* Subject Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subject Focus</CardTitle>
              <CardDescription>
                Select a subject to focus the AI's knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="subject-select">Medical Subject</Label>
                <Select 
                  value={selectedSubject} 
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger id="subject-select">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Medical</SelectItem>
                    <SelectItem value="anatomy">Anatomy</SelectItem>
                    <SelectItem value="physiology">Physiology</SelectItem>
                    <SelectItem value="pathology">Pathology</SelectItem>
                    <SelectItem value="pharmacology">Pharmacology</SelectItem>
                    <SelectItem value="medicine">Internal Medicine</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Token Usage</CardTitle>
              <CardDescription>
                Your current GPT-4o token consumption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Used</span>
                    <span>{Math.round((tokenUsage / tokenLimit) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${Math.min(Math.round((tokenUsage / tokenLimit) * 100), 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {tokenUsage.toLocaleString()} / {tokenLimit.toLocaleString()} tokens
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              {user?.subscriptionStatus === 'free_trial'
                ? "Free trial includes 20,000 tokens. Upgrade for more."
                : "Premium subscription with unlimited tokens."
              }
            </CardFooter>
          </Card>
          
          {/* Usage Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips for Better Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Be specific in your questions</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Ask for explanations of complex topics</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Request diagrams or step-by-step explanations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Ask for mnemonics to help remember concepts</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Request practice questions on a topic</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AiChatPage;

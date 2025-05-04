import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { sendChatMessage } from '@/lib/ai-service';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  placeholder?: string;
  systemMessage?: string;
  onTokenUsageUpdate?: (usage: number) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  placeholder = 'Type your medical question here...',
  systemMessage = 'Ask me any medical question, and I\'ll try to help!',
  onTokenUsageUpdate
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: systemMessage,
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await sendChatMessage(inputMessage, conversationHistory);

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update token usage if callback provided
      if (onTokenUsageUpdate && response.tokenUsage) {
        onTokenUsageUpdate(response.tokenUsage.current);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startVoiceInput = () => {
    // Voice input functionality would be implemented here
    toast({
      title: "Voice Input",
      description: "Voice input feature coming soon!",
      variant: "default"
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[70vh] bg-white rounded-lg shadow overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`
              max-w-[80%] md:max-w-[70%] shadow-sm
              ${message.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}
            `}>
              <CardContent className="p-3">
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`
                  text-xs mt-2 text-right
                  ${message.sender === 'user' ? 'text-primary-50' : 'text-gray-400'}
                `}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] md:max-w-[70%] bg-gray-100">
              <CardContent className="p-3 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">DRNXT is thinking...</span>
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <div className="flex flex-col space-y-2">
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={startVoiceInput}
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button 
              type="submit" 
              variant="default" 
              size="icon"
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
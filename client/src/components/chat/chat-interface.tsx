import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Send, Plus, PaperclipIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { ChatHistory, ChatMessage } from "@shared/schema";

interface ChatInterfaceProps {
  activeChatId?: number;
}

export function ChatInterface({ activeChatId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [currentChatId, setCurrentChatId] = useState<number | undefined>(activeChatId);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat histories
  const { data: chatHistories, isLoading: loadingChats } = useQuery<ChatHistory[]>({
    queryKey: ["/api/chat"],
    enabled: !!user,
  });

  // Fetch messages for the current chat
  const { data: currentChat, isLoading: loadingMessages } = useQuery<{messages: ChatMessage[]} & ChatHistory>({
    queryKey: ["/api/chat", currentChatId],
    enabled: !!currentChatId,
  });

  // Create a new chat
  const createChatMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/chat", { title: "New Chat" });
      return await res.json();
    },
    onSuccess: (newChat: ChatHistory) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
      setCurrentChatId(newChat.id);
    },
  });

  // Send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/chat/${currentChatId}/message`, { message: content });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", currentChatId] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    if (!currentChatId) {
      createChatMutation.mutate();
      // Store the message to send after chat creation
      localStorage.setItem("pendingMessage", message);
    } else {
      sendMessageMutation.mutate(message);
      setMessage("");
    }
  };

  // Handle creating a new chat
  const handleNewChat = () => {
    createChatMutation.mutate();
  };

  // Handle switching between chats
  const handleSelectChat = (chatId: number) => {
    setCurrentChatId(chatId);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  // Send pending message after chat creation
  useEffect(() => {
    if (currentChatId && !sendMessageMutation.isPending) {
      const pendingMessage = localStorage.getItem("pendingMessage");
      if (pendingMessage) {
        sendMessageMutation.mutate(pendingMessage);
        localStorage.removeItem("pendingMessage");
        setMessage("");
      }
    }
  }, [currentChatId, sendMessageMutation.isPending]);

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {/* Chat history sidebar */}
      <div className="hidden md:block w-64 border-r border-neutral-200 bg-white">
        <div className="p-4 border-b border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-800">AI Medical Assistant</h3>
        </div>
        <div className="p-4">
          <Button 
            className="w-full flex items-center justify-center" 
            onClick={handleNewChat}
            disabled={createChatMutation.isPending}
          >
            {createChatMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            New Chat
          </Button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-7rem)]">
          <div className="px-4 py-2">
            <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Recent Conversations</h4>
          </div>
          <ul className="mt-2">
            {loadingChats ? (
              <div className="px-4 py-2 text-sm text-neutral-500">Loading chats...</div>
            ) : chatHistories && chatHistories.length > 0 ? (
              chatHistories.map((chat) => (
                <li key={chat.id}>
                  <button
                    onClick={() => handleSelectChat(chat.id)}
                    className={`block px-4 py-2 w-full text-left hover:bg-neutral-50 text-sm ${currentChatId === chat.id ? 'bg-neutral-50 text-primary-600' : 'text-neutral-700'}`}
                  >
                    <div className="flex items-center">
                      <MessageIcon className="h-4 w-4 mr-2 text-neutral-500" />
                      <span className="truncate">{chat.title || `Chat ${chat.id}`}</span>
                    </div>
                    <div className="ml-6 text-xs text-neutral-500 mt-0.5">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                </li>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-neutral-500">No conversations yet</div>
            )}
          </ul>
        </div>
      </div>
      
      {/* Chat main area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentChatId ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <MessageIcon className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">AI Medical Assistant</h3>
              <p className="text-neutral-500 max-w-sm mb-6">
                I can help answer your medical questions, explain concepts, and assist with your studies. Start a new conversation to begin.
              </p>
              <Button onClick={handleNewChat} disabled={createChatMutation.isPending}>
                {createChatMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                New Chat
              </Button>
            </div>
          ) : loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <>
              {/* System message */}
              <div className="flex items-start">
                <Avatar className="h-10 w-10 bg-primary-100">
                  <AvatarFallback className="text-primary-500">AI</AvatarFallback>
                </Avatar>
                <div className="ml-3 bg-neutral-100 rounded-lg px-4 py-3 max-w-2xl">
                  <p className="text-sm text-neutral-800">
                    Hello! I'm your AI Medical Assistant powered by GPT-4o. I can help answer your medical questions, explain concepts, and assist with your studies. How can I help you today?
                  </p>
                </div>
              </div>
              
              {/* Chat messages */}
              {currentChat?.messages && currentChat.messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role !== 'user' && (
                    <Avatar className="h-10 w-10 bg-primary-100">
                      <AvatarFallback className="text-primary-500">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={`mx-3 px-4 py-3 max-w-2xl rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <Avatar className="h-10 w-10 bg-neutral-200">
                      <AvatarFallback>{getInitials(user?.fullName || user?.username || "")}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {/* Pending message indicator */}
              {sendMessageMutation.isPending && (
                <div className="flex items-start">
                  <Avatar className="h-10 w-10 bg-primary-100">
                    <AvatarFallback className="text-primary-500">AI</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 bg-neutral-100 rounded-lg px-4 py-3">
                    <div className="flex space-x-2 items-center">
                      <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce delay-100"></div>
                      <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Invisible element to scroll to */}
              <div ref={endOfMessagesRef} />
            </>
          )}
        </div>
        
        {/* Input area */}
        <div className="border-t border-neutral-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="text-neutral-500 hover:text-neutral-700"
              disabled={sendMessageMutation.isPending}
            >
              <PaperclipIcon className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your medical question..."
                disabled={sendMessageMutation.isPending || !currentChatId && createChatMutation.isPending}
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              size="icon"
              disabled={!message.trim() || sendMessageMutation.isPending || !currentChatId && createChatMutation.isPending}
            >
              {sendMessageMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
          <div className="mt-2 text-xs text-neutral-500 flex items-center">
            <InfoIcon className="h-3 w-3 mr-1" />
            <span>All responses are based on standard medical textbooks and references</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

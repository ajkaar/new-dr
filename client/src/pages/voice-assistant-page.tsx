import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, MessageSquare, Play, Pause, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layouts/app-layout';
import { VolumeIcon } from '@/components/icons/volume-icon';

// Sample conversation history (would come from API in real app)
const sampleHistory = [
  {
    id: 1,
    title: "NSAID Mechanism of Action",
    date: "2023-04-28T10:30:00Z",
    summary: "Explanation of how NSAIDs work through COX inhibition and their effects on prostaglandin synthesis."
  },
  {
    id: 2,
    title: "Antibiotic Classes",
    date: "2023-04-25T14:15:00Z",
    summary: "Overview of major antibiotic classes, mechanisms, and clinical applications."
  },
  {
    id: 3,
    title: "Heart Murmurs",
    date: "2023-04-20T09:45:00Z",
    summary: "Discussion of different types of heart murmurs, their characteristics, and clinical significance."
  }
];

// Voice command help examples
const commandExamples = [
  "Explain the Krebs cycle",
  "Describe the mechanism of action of beta blockers",
  "What are the symptoms of Parkinson's disease?",
  "Create a mnemonic for cranial nerves",
  "Generate a quick quiz on renal physiology",
  "What's new in diabetes treatment?",
  "Explain the difference between systolic and diastolic heart failure"
];

interface VoiceCommandResult {
  command: string;
  response: string;
  isProcessing: boolean;
}

const VoiceAssistantPage: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("assistant");
  const [commandResults, setCommandResults] = useState<VoiceCommandResult[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Reference for SpeechRecognition
  const recognitionRef = useRef<any>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast({
            title: "Voice Recognition Error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive",
          });
        };
        
        recognitionRef.current.onend = () => {
          if (isListening) {
            recognitionRef.current.start();
          }
        };
      } else {
        toast({
          title: "Voice Assistant Not Available",
          description: "Your browser doesn't support speech recognition. Try using Chrome.",
          variant: "destructive",
        });
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, toast]);
  
  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setTranscript("");
    }
  };
  
  // Process voice command
  const processCommand = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Empty Command",
        description: "Please speak a command first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsListening(false);
    recognitionRef.current?.stop();
    setIsProcessing(true);
    
    // Add to command results with isProcessing flag
    const newCommand: VoiceCommandResult = {
      command: transcript,
      response: "",
      isProcessing: true
    };
    
    setCommandResults(prev => [newCommand, ...prev]);
    
    try {
      // In a real app, we would send the command to the API
      // For now, simulate a delay and a response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response based on command
      let response = "";
      if (transcript.toLowerCase().includes("krebs cycle") || transcript.toLowerCase().includes("citric acid cycle")) {
        response = "The Krebs cycle, also known as the citric acid cycle or TCA cycle, is a series of chemical reactions that generate energy through the oxidation of acetyl-CoA derived from carbohydrates, fats, and proteins. It takes place in the mitochondrial matrix and is a central pathway in cellular respiration. The cycle involves 8 major steps, beginning with citrate and ending with oxaloacetate, which can then combine with another acetyl-CoA to restart the cycle.";
      } else if (transcript.toLowerCase().includes("beta blocker")) {
        response = "Beta blockers work by blocking the effects of epinephrine (adrenaline) on beta-adrenergic receptors. They primarily affect β1 receptors in the heart, reducing heart rate, contractility, and blood pressure. In the respiratory system, they can affect β2 receptors, potentially causing bronchoconstriction. Beta blockers are commonly used to treat hypertension, angina, heart failure, arrhythmias, and other cardiovascular conditions.";
      } else {
        response = "I understand your question about " + transcript + ". This is a complex medical topic that involves multiple physiological systems. In a comprehensive answer, I would cover the relevant anatomy, physiology, pathology, clinical presentation, diagnostic approaches, and management principles based on current medical evidence and guidelines.";
      }
      
      // Update the command result with the response
      setCommandResults(prev => 
        prev.map((item, index) => 
          index === 0 ? { ...item, response, isProcessing: false } : item
        )
      );
      
      // Speak the response (if browser supports speech synthesis)
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(response);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
      }
      
    } catch (error) {
      console.error("Error processing command:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process your command. Please try again.",
        variant: "destructive",
      });
      
      // Update the command with error
      setCommandResults(prev => 
        prev.map((item, index) => 
          index === 0 ? { ...item, response: "Error processing command. Please try again.", isProcessing: false } : item
        )
      );
    } finally {
      setIsProcessing(false);
      setTranscript("");
    }
  };
  
  // Stop speech synthesis
  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };
  
  // Use a command example
  const useExample = (example: string) => {
    setTranscript(example);
  };
  
  return (
    <AppLayout 
      title="AI Voice Assistant" 
      description="Interact with DRNXT Learning using voice commands and get spoken responses"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="assistant">Voice Assistant</TabsTrigger>
          <TabsTrigger value="history">Conversation History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assistant">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <VolumeIcon className="mr-2 h-5 w-5 text-primary" />
                  Voice Interaction
                </CardTitle>
                <CardDescription>
                  Ask questions, get explanations, or request study materials using your voice
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Transcript Display */}
                  <div className="relative">
                    <textarea
                      className="w-full h-32 p-4 border rounded-md resize-none bg-background text-foreground"
                      placeholder="Your voice command will appear here..."
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      disabled={isListening || isProcessing}
                    />
                    <div className="absolute right-3 bottom-3">
                      {isListening && (
                        <div className="flex items-center space-x-1 text-primary animate-pulse">
                          <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
                          <span className="h-2.5 w-1.5 bg-primary rounded-full"></span>
                          <span className="h-3.5 w-1.5 bg-primary rounded-full"></span>
                          <span className="h-2.5 w-1.5 bg-primary rounded-full"></span>
                          <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
                          <span className="ml-1 text-xs">Listening...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Voice Controls */}
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={toggleListening}
                      disabled={isProcessing}
                      variant={isListening ? "destructive" : "default"}
                      className="flex-1"
                    >
                      {isListening ? (
                        <>
                          <MicOff className="mr-2 h-4 w-4" />
                          Stop Listening
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Start Listening
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={processCommand}
                      disabled={!transcript.trim() || isProcessing || isListening}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Process Command
                        </>
                      )}
                    </Button>
                    
                    {isPlaying ? (
                      <Button 
                        onClick={stopSpeech}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Stop Speaking
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => {
                          if (commandResults.length > 0 && window.speechSynthesis) {
                            const utterance = new SpeechSynthesisUtterance(commandResults[0].response);
                            window.speechSynthesis.speak(utterance);
                            setIsPlaying(true);
                            
                            utterance.onend = () => {
                              setIsPlaying(false);
                            };
                          }
                        }}
                        variant="outline"
                        disabled={!commandResults.length || !commandResults[0].response}
                        className="w-full sm:w-auto"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Replay Response
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Previous Commands and Responses */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Recent Interactions</h3>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-6">
                      {commandResults.map((result, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <MessageSquare className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">You asked:</p>
                              <p className="text-sm">{result.command}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                              <VolumeIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Assistant response:</p>
                              {result.isProcessing ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Processing your request...</span>
                                </div>
                              ) : (
                                <p className="text-sm">{result.response}</p>
                              )}
                            </div>
                          </div>
                          
                          {index < commandResults.length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </div>
                      ))}
                      
                      {commandResults.length === 0 && (
                        <div className="text-center py-12">
                          <VolumeIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                          <h3 className="mt-4 text-lg font-medium">No interactions yet</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Use the voice command feature to start a conversation
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Command Examples</CardTitle>
                <CardDescription>
                  Click on any example to use it as your command
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commandExamples.map((example, index) => (
                    <Button 
                      key={index}
                      variant="ghost" 
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => useExample(example)}
                      disabled={isListening || isProcessing}
                    >
                      <span className="mr-2 text-xs text-muted-foreground">#{index + 1}</span>
                      {example}
                    </Button>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Voice Commands Tips</h4>
                  <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                    <li>Speak clearly and use medical terminology</li>
                    <li>Ask specific questions for better results</li>
                    <li>Include the topic or subject area in your question</li>
                    <li>For mnemonics, specify "create a mnemonic for..."</li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Not all features may be available in every browser. The voice assistant works best in Chrome.
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
              <CardDescription>
                Review your past conversations with the voice assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sampleHistory.length > 0 ? (
                <div className="space-y-6">
                  {sampleHistory.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{item.title}</h3>
                        <Badge variant="outline">
                          {new Date(item.date).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.summary}</p>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Play className="mr-2 h-3 w-3" />
                          Play
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No conversation history yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your conversation history will appear here once you use the voice assistant
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Voice conversations are saved for 30 days
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default VoiceAssistantPage;
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";

// Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AiChatPage from "@/pages/ai-chat-page";
import DiagnosisToolPage from "@/pages/diagnosis-tool-page";
import QuizGeneratorPage from "@/pages/quiz-generator-page";
import NeetPgPage from "@/pages/neet-pg-page";
import MemoryBoosterPage from "@/pages/memory-booster-page";
import VoiceAssistantPage from "@/pages/voice-assistant-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/ai-chat" component={AiChatPage} />
      <Route path="/diagnosis-tool" component={DiagnosisToolPage} />
      <Route path="/quiz-generator" component={QuizGeneratorPage} />
      <Route path="/neet-pg" component={NeetPgPage} />
      <Route path="/memory-booster" component={MemoryBoosterPage} />
      <Route path="/voice-assistant" component={VoiceAssistantPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

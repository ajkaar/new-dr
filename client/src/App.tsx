
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

// Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AiChatPage from "@/pages/ai-chat-page";
import DiagnosisToolPage from "@/pages/diagnosis-tool-page";
import QuizGeneratorPage from "@/pages/quiz-generator-page";
import NeetPgPage from "@/pages/neet-pg-page";
import MemoryBoosterPage from "@/pages/memory-booster-page";
import VoiceAssistantPage from "@/pages/voice-assistant-page";
import CaseGeneratorPage from "@/pages/case-generator-page";
import DrugAssistantPage from "@/pages/drug-assistant-page";
import NotesMakerPage from "@/pages/notes-maker-page";
import StudyPlannerPage from "@/pages/study-planner-page";
import MedFeedPage from "@/pages/med-feed-page";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to auth if not logged in and not already on auth page
  if (!user && window.location.pathname !== '/auth') {
    return <Redirect to="/auth" />;
  }

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
      <Route path="/case-generator" component={CaseGeneratorPage} />
      <Route path="/drug-assistant" component={DrugAssistantPage} />
      <Route path="/notes-maker" component={NotesMakerPage} />
      <Route path="/study-planner" component={StudyPlannerPage} />
      <Route path="/med-feed" component={MedFeedPage} />
      <Route path="/settings" component={ProfileSettingsPage} />
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

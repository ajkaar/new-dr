import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AiChatPage from "@/pages/ai-chat-page";
import DiagnosisToolPage from "@/pages/diagnosis-tool-page";
import QuizGeneratorPage from "@/pages/quiz-generator-page";
import NeetPgPage from "@/pages/neet-pg-page";
import MemoryBoosterPage from "@/pages/memory-booster-page";
import CaseGeneratorPage from "@/pages/case-generator-page";
import DrugAssistantPage from "@/pages/drug-assistant-page";
import StudyPlannerPage from "@/pages/study-planner-page";
import NotesMakerPage from "@/pages/notes-maker-page";
import MedFeedPage from "@/pages/med-feed-page";
import HelpSupportPage from "@/pages/help-support-page";
import AdminPage from "@/pages/admin-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/ai-chat" component={AiChatPage} />
      <ProtectedRoute path="/diagnosis-tool" component={DiagnosisToolPage} />
      <ProtectedRoute path="/quiz-generator" component={QuizGeneratorPage} />
      <ProtectedRoute path="/neet-pg" component={NeetPgPage} />
      <ProtectedRoute path="/memory-booster" component={MemoryBoosterPage} />
      <ProtectedRoute path="/case-generator" component={CaseGeneratorPage} />
      <ProtectedRoute path="/drug-assistant" component={DrugAssistantPage} />
      <ProtectedRoute path="/study-planner" component={StudyPlannerPage} />
      <ProtectedRoute path="/notes-maker" component={NotesMakerPage} />
      <ProtectedRoute path="/med-feed" component={MedFeedPage} />
      <ProtectedRoute path="/help-support" component={HelpSupportPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
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

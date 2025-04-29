import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ThemeProvider } from "next-themes";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import ChatAssistant from "@/pages/chat-assistant";
import DiagnosisTool from "@/pages/diagnosis-tool";
import QuizGenerator from "@/pages/quiz-generator";
import NeetPgPrep from "@/pages/neet-pg-prep";
import MemoryBooster from "@/pages/memory-booster";
import CaseGenerator from "@/pages/case-generator";
import DrugAssistant from "@/pages/drug-assistant";
import StudyPlanner from "@/pages/study-planner";
import NotesMaker from "@/pages/notes-maker";
import MedicalNews from "@/pages/medical-news";
import HelpSupport from "@/pages/help-support";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/chat" component={ChatAssistant} />
      <ProtectedRoute path="/diagnosis" component={DiagnosisTool} />
      <ProtectedRoute path="/quiz" component={QuizGenerator} />
      <ProtectedRoute path="/neetpg" component={NeetPgPrep} />
      <ProtectedRoute path="/memory" component={MemoryBooster} />
      <ProtectedRoute path="/cases" component={CaseGenerator} />
      <ProtectedRoute path="/drugs" component={DrugAssistant} />
      <ProtectedRoute path="/planner" component={StudyPlanner} />
      <ProtectedRoute path="/notes" component={NotesMaker} />
      <ProtectedRoute path="/news" component={MedicalNews} />
      <ProtectedRoute path="/help" component={HelpSupport} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

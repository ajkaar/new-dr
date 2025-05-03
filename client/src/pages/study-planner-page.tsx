
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import AppLayout from "@/components/layouts/app-layout";

export default function StudyPlannerPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <AppLayout
      title="Study Planner"
      description="Plan and track your medical studies"
    >
      <div className="max-w-4xl mx-auto p-4">
        <h1>Study Planner - Coming Soon</h1>
      </div>
    </AppLayout>
  );
}

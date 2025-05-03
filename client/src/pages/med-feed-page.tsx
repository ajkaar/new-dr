
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import AppLayout from "@/components/layouts/app-layout";

export default function MedFeedPage() {
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
      title="MedFeed"
      description="Stay updated with medical news and updates"
    >
      <div className="max-w-4xl mx-auto p-4">
        <h1>MedFeed - Coming Soon</h1>
      </div>
    </AppLayout>
  );
}

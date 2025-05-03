
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layouts/app-layout";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export default function DrugAssistantPage() {
  const { user, isLoading } = useAuth();
  const [drugName, setDrugName] = useState("");
  const [drugInfo, setDrugInfo] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

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

  const handleSearch = async () => {
    if (!drugName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a drug name",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch("/api/drug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: drugName }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch drug information");
      }

      const data = await response.json();
      setDrugInfo(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch drug information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AppLayout
      title="Drug Assistant"
      description="Get detailed information about medications based on Indian medical standards"
    >
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Search Drug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter drug name..."
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {drugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>{drugName.toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none space-y-6">
                {Object.entries(JSON.parse(drugInfo.drugInfo)).map(([key, value]: [string, any]) => {
                  if (key === "tokenUsage") return null;
                  return (
                    <div key={key} className="space-y-2">
                      <h3 className="text-lg font-semibold border-b pb-2">{key}</h3>
                      {typeof value === 'string' ? (
                        <div className="whitespace-pre-wrap text-sm">{value}</div>
                      ) : (
                        <ul className="list-disc list-inside">
                          {Object.entries(value).map(([subKey, subValue]: [string, any]) => (
                            <li key={subKey} className="text-sm">
                              <strong>{subKey}:</strong> {subValue}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

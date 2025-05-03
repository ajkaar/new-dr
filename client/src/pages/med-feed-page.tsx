
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Filter, Bookmark, Clock, ExternalLink } from "lucide-react";
import { Redirect } from "wouter";
import AppLayout from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewsItem } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function MedFeedPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const { data: news, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["news", category, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: category === "all" ? "" : category,
        sort: sortBy,
      });
      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) throw new Error("Failed to fetch news");
      return response.json();
    },
  });

  const handleBookmark = async (newsId: string) => {
    try {
      const response = await fetch("/api/news/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId }),
      });
      if (!response.ok) throw new Error("Failed to bookmark");
      toast({
        title: "Success",
        description: "News item bookmarked successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to bookmark news item",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
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
      description="Latest Medical News & Updates"
    >
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Exam">Exam Updates</SelectItem>
              <SelectItem value="Guidelines">Guidelines</SelectItem>
              <SelectItem value="Research">Research</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* News Feed */}
        <div className="grid gap-6">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading news...</p>
            </div>
          ) : news && news.length > 0 ? (
            news.map((item, index) => (
              <Card 
                key={item.id}
                className={item.isSponsored ? "border-primary/20 bg-primary/5" : ""}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={item.isSponsored ? "default" : "secondary"}>
                          {item.category}
                        </Badge>
                        {item.isSponsored && (
                          <Badge variant="outline">Sponsored</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground mb-4">{item.summary}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                          onClick={() => handleBookmark(item.id)}
                        >
                          <Bookmark className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                        >
                          <a 
                            href={item.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            Read More
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No news articles found</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

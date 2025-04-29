import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { MedicalNews } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsUpdatesProps {
  limit?: number;
}

export function NewsUpdates({ limit = 3 }: NewsUpdatesProps) {
  const { data: news, isLoading, error } = useQuery<MedicalNews[]>({
    queryKey: ["/api/news"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-neutral-800">Medical News & Updates</h3>
            <a href="/news" className="text-sm font-medium text-primary-500 hover:text-primary-600">View all</a>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array(limit).fill(0).map((_, i) => (
              <div key={i} className="bg-neutral-50 p-4 rounded-lg">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-full mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
          <h3 className="text-lg font-medium text-neutral-800">Medical News & Updates</h3>
        </CardHeader>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="text-center py-6 text-neutral-500">
            Error loading news. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayNews = news?.slice(0, limit) || [];

  return (
    <Card>
      <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-800">Medical News & Updates</h3>
          <a href="/news" className="text-sm font-medium text-primary-500 hover:text-primary-600">View all</a>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayNews.map((item) => (
            <div key={item.id} className="bg-neutral-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-neutral-800">{item.title}</h4>
              <p className="mt-1 text-xs text-neutral-600 line-clamp-2">{item.content}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  {new Date(item.createdAt).toLocaleDateString("en-US", { 
                    year: "numeric", 
                    month: "short", 
                    day: "numeric" 
                  })}
                </span>
                <a href={`/news/${item.id}`} className="text-xs font-medium text-primary-500 hover:text-primary-600">Read more</a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { BookOpen, MessageCircle, FileText, Stethoscope } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface ActivityItem {
  id: number;
  type: 'quiz' | 'chat' | 'notes' | 'diagnosis';
  title: string;
  details: string;
  timestamp: Date;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'quiz':
        return <BookOpen className="text-primary-500" />;
      case 'chat':
        return <MessageCircle className="text-secondary-500" />;
      case 'notes':
        return <FileText className="text-amber-500" />;
      case 'diagnosis':
        return <Stethoscope className="text-green-500" />;
      default:
        return <BookOpen className="text-primary-500" />;
    }
  };
  
  const getBackgroundForType = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'bg-primary-100';
      case 'chat':
        return 'bg-secondary-100';
      case 'notes':
        return 'bg-amber-100';
      case 'diagnosis':
        return 'bg-green-100';
      default:
        return 'bg-primary-100';
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <h3 className="text-lg font-medium text-neutral-800">Recent Activity</h3>
      </CardHeader>
      <div className="relative">
        <ul className="divide-y divide-neutral-200 overflow-y-auto max-h-72">
          {activities.map((activity) => (
            <li key={activity.id} className="px-4 py-4 sm:px-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className={`h-8 w-8 rounded-full ${getBackgroundForType(activity.type)} flex items-center justify-center`}>
                    {getIconForType(activity.type)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-800">{activity.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{activity.details} · {timeAgo(activity.timestamp)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <CardFooter className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 text-sm sm:px-6">
        <a href="#" className="text-primary-500 font-medium hover:text-primary-600">View all activity →</a>
      </CardFooter>
    </Card>
  );
}

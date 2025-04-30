import React from 'react';
import { FileText, HelpCircle, ClipboardList } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItemProps {
  type: 'note' | 'quiz' | 'case' | string;
  title: string;
  description: string;
  date: Date | string;
  status?: string;
  score?: number;
  total?: number;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  type,
  title,
  description,
  date,
  status,
  score,
  total
}) => {
  // Format date as "2 hours ago", "Yesterday", etc.
  const formattedDate = typeof date === 'string' 
    ? formatDistanceToNow(new Date(date), { addSuffix: true })
    : formatDistanceToNow(date, { addSuffix: true });
  
  // Determine icon based on activity type
  let icon;
  let iconColor;
  
  switch (type) {
    case 'note':
      icon = <FileText className="text-2xl" />;
      iconColor = "text-primary";
      break;
    case 'quiz':
      icon = <HelpCircle className="text-2xl" />;
      iconColor = "text-secondary-500";
      break;
    case 'case':
      icon = <ClipboardList className="text-2xl" />;
      iconColor = "text-accent-500";
      break;
    default:
      icon = <FileText className="text-2xl" />;
      iconColor = "text-primary";
  }

  // Calculate badge color based on score if available
  let badgeColor = "bg-green-100 text-green-800";
  if (score !== undefined && total !== undefined) {
    const percentage = (score / total) * 100;
    if (percentage < 60) {
      badgeColor = "bg-red-100 text-red-800";
    } else if (percentage < 80) {
      badgeColor = "bg-yellow-100 text-yellow-800";
    }
  }
  
  return (
    <li className="py-3">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {title}
          </p>
          <p className="text-sm text-gray-500">
            {description}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-sm text-gray-500">{formattedDate}</p>
          <p className="mt-1">
            {status && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {status}
              </span>
            )}
            {score !== undefined && total !== undefined && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                {Math.round((score / total) * 100)}%
              </span>
            )}
          </p>
        </div>
      </div>
    </li>
  );
};

export default ActivityItem;

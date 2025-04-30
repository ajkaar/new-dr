import React from 'react';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  imageUrl: string;
  category: string;
  title: string;
  summary: string;
  date: Date | string;
  categoryColor?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
  imageUrl,
  category,
  title,
  summary,
  date,
  categoryColor = "bg-primary-100 text-primary-800"
}) => {
  // Format date
  const formattedDate = typeof date === 'string' 
    ? formatDistanceToNow(new Date(date), { addSuffix: true })
    : formatDistanceToNow(date, { addSuffix: true });

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Use a default medical image */}
      <div 
        className="h-48 w-full bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${imageUrl || 'https://cdn.pixabay.com/photo/2016/11/09/15/27/dna-1811955_1280.jpg'})` 
        }}
      >
      </div>
      <div className="p-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
          {category}
        </span>
        <h3 className="mt-2 text-base font-medium text-gray-900 line-clamp-2">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{summary}</p>
        <div className="mt-3 flex items-center">
          <div className="flex-shrink-0">
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
          <div className="ml-1">
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;

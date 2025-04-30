import React, { ReactNode } from 'react';
import { Link } from 'wouter';

interface RecommendationItemProps {
  icon: ReactNode;
  iconColor: string;
  title: string;
  subtitle: string;
  link: string;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({
  icon,
  iconColor,
  title,
  subtitle,
  link
}) => {
  return (
    <li className="py-3">
      <Link href={link}>
        <a className="block hover:bg-gray-50 rounded-md transition-colors duration-150">
          <div className="flex items-center space-x-4 px-2 py-1">
            <div className="flex-shrink-0">
              <span className={iconColor}>{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {title}
              </p>
              <p className="text-xs text-gray-500">
                {subtitle}
              </p>
            </div>
          </div>
        </a>
      </Link>
    </li>
  );
};

export default RecommendationItem;

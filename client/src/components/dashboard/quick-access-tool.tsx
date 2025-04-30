import React, { ReactNode } from 'react';
import { Link } from 'wouter';

interface QuickAccessToolProps {
  icon: ReactNode;
  title: string;
  link: string;
}

const QuickAccessTool: React.FC<QuickAccessToolProps> = ({
  icon,
  title,
  link
}) => {
  return (
    <Link href={link}>
      <a className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col items-center hover:border-primary hover:shadow-md transition-all">
        <span className="text-3xl text-primary mb-2">{icon}</span>
        <span className="mt-2 text-sm font-medium text-gray-900 text-center">{title}</span>
      </a>
    </Link>
  );
};

export default QuickAccessTool;

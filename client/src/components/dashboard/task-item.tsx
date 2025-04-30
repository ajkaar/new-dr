import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskItemProps {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'Medium' | 'Low';
  completed?: boolean;
  onCompletionChange?: (id: string, completed: boolean) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  description,
  priority,
  completed = false,
  onCompletionChange
}) => {
  const [isChecked, setIsChecked] = useState(completed);
  
  // Get badge color based on priority
  const getBadgeColor = () => {
    switch (priority) {
      case 'Critical':
        return 'bg-primary-100 text-primary-800';
      case 'Medium':
        return 'bg-gray-100 text-gray-800';
      case 'Low':
        return 'bg-secondary-100 text-secondary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
    if (onCompletionChange) {
      onCompletionChange(id, checked);
    }
  };
  
  return (
    <li className={`bg-gray-50 p-3 rounded-md ${isChecked ? 'opacity-60' : ''}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <Checkbox 
            checked={isChecked} 
            onCheckedChange={handleCheckboxChange}
            id={`task-${id}`}
          />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium text-gray-900 ${isChecked ? 'line-through' : ''}`}>
            {title}
          </p>
          <p className="text-xs text-gray-500">
            {description}
          </p>
        </div>
        <div className="ml-2 flex-shrink-0">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor()}`}>
            {priority}
          </span>
        </div>
      </div>
    </li>
  );
};

export default TaskItem;

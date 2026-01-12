import React from 'react';
import { FileQuestion, Search, Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ 
  icon: Icon = Inbox, 
  title = 'No data found', 
  description = 'Get started by creating a new item',
  actionLabel,
  onAction,
  variant = 'default' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-400',
    search: 'bg-blue-50 text-blue-400',
    error: 'bg-red-50 text-red-400',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${variants[variant]}`}>
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;

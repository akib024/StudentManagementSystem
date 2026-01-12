import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <Loader2 className={`${sizes[size]} text-blue-600 animate-spin`} />
      {text && <span className={`${textSizes[size]} text-gray-600 font-medium`}>{text}</span>}
    </div>
  );
};

export default LoadingSpinner;

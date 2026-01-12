import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const PageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600 font-medium">{text}</p>
      </div>
    </div>
  );
};

export default PageLoader;

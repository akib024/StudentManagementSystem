import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const Alert = ({
  type = 'info', // info, success, warning, error
  title,
  message,
  onClose,
  className = '',
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      message: 'text-blue-700',
      Icon: Info,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-800',
      message: 'text-green-700',
      Icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      Icon: AlertTriangle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      message: 'text-red-700',
      Icon: AlertCircle,
    },
  };

  const style = styles[type];
  const IconComponent = style.Icon;

  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent className={`h-5 w-5 ${style.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          {title && <h3 className={`text-sm font-semibold ${style.title}`}>{title}</h3>}
          {message && <p className={`text-sm ${style.message} ${title ? 'mt-1' : ''}`}>{message}</p>}
        </div>
        {onClose && (
          <div className="flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex rounded-lg p-1.5 ${style.icon} hover:bg-white/50 focus:outline-none transition-colors`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;

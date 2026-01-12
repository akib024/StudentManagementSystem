import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'md', // none, sm, md, lg
  shadow = 'md', // none, sm, md, lg
  rounded = 'lg', // none, sm, md, lg, xl
  hover = false,
  onClick,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };

  const roundedStyles = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  };

  const hoverStyles = hover
    ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
    : '';

  return (
    <div
      className={`bg-white border border-gray-200 ${paddingStyles[padding]} ${shadowStyles[shadow]} ${roundedStyles[rounded]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Card Header subcomponent
Card.Header = ({ children, className = '', border = true }) => (
  <div className={`${border ? 'border-b border-gray-200 pb-4 mb-4' : ''} ${className}`}>
    {children}
  </div>
);

// Card Title subcomponent
Card.Title = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
);

// Card Description subcomponent
Card.Description = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>
);

// Card Body subcomponent
Card.Body = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

// Card Footer subcomponent
Card.Footer = ({ children, className = '', border = true }) => (
  <div className={`${border ? 'border-t border-gray-200 pt-4 mt-4' : ''} ${className}`}>
    {children}
  </div>
);

export default Card;

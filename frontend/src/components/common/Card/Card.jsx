import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  title, 
  subtitle,
  icon,
  actions,
  footer,
  variant = 'default',
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  padding = 'default',
  shadow = 'md',
  bordered = false,
  hoverable = false,
  ...props 
}) => {
  // Variant styles
  const variantClasses = {
    default: 'bg-white',
    primary: 'bg-primary-50 border-primary-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  // Shadow styles
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  // Padding styles
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    default: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  // Border style
  const borderClass = bordered ? 'border border-gray-200' : '';
  
  // Hover effect
  const hoverClass = hoverable ? 'transition-shadow duration-300 hover:shadow-lg' : '';

  return (
    <div 
      className={`
        rounded-lg overflow-hidden 
        ${variantClasses[variant]} 
        ${shadowClasses[shadow]} 
        ${borderClass}
        ${hoverClass}
        ${className}
      `}
      {...props}
    >
      {/* Card Header */}
      {(title || subtitle || icon || actions) && (
        <div className={`flex justify-between items-center px-4 py-3 border-b border-gray-200 ${headerClassName}`}>
          <div className="flex items-center space-x-3">
            {icon && <div className="text-gray-500">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}

      {/* Card Body */}
      <div className={`${paddingClasses[padding]} ${bodyClassName}`}>
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className={`px-4 py-3 bg-gray-50 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  icon: PropTypes.node,
  actions: PropTypes.node,
  footer: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info']),
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg', 'xl']),
  shadow: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  bordered: PropTypes.bool,
  hoverable: PropTypes.bool
};

export default Card;
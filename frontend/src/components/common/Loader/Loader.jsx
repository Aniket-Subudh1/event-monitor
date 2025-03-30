import React from 'react';
import PropTypes from 'prop-types';

const Loader = ({
  size = 'md',
  color = 'primary',
  label = '',
  variant = 'spinner',
  fullScreen = false,
  className = '',
  ...props
}) => {
  // Size mappings
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Color mappings
  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
    success: 'text-green-500',
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  // Common animation classes
  const animationClasses = 'animate-spin';

  // Render different loader variants
  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <svg
            className={`${animationClasses} ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            {...props}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );

      case 'dots':
        return (
          <div className={`flex space-x-2 ${className}`}>
            <div
              className={`${sizeClasses[size].split(' ')[0].replace('h-', 'h-').replace('w-', 'w-1/3')} ${colorClasses[color]} rounded-full animate-bounce`}
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className={`${sizeClasses[size].split(' ')[0].replace('h-', 'h-').replace('w-', 'w-1/3')} ${colorClasses[color]} rounded-full animate-bounce`}
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className={`${sizeClasses[size].split(' ')[0].replace('h-', 'h-').replace('w-', 'w-1/3')} ${colorClasses[color]} rounded-full animate-bounce`}
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        );

      case 'pulse':
        return (
          <div
            className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse ${className}`}
            {...props}
          ></div>
        );

      default:
        return (
          <svg
            className={`${animationClasses} ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            {...props}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
    }
  };

  // If fullScreen, render in the center of the screen
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="flex flex-col items-center">
          {renderLoader()}
          {label && (
            <span className="mt-4 text-center font-medium text-white">{label}</span>
          )}
        </div>
      </div>
    );
  }

  // Standard rendering with optional label
  return (
    <div className="flex flex-col items-center">
      {renderLoader()}
      {label && (
        <span className="mt-2 text-sm text-center font-medium text-gray-500">{label}</span>
      )}
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'white',
    'gray',
    'success',
    'danger',
    'warning',
    'info',
  ]),
  label: PropTypes.string,
  variant: PropTypes.oneOf(['spinner', 'dots', 'pulse']),
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
};

export default Loader;
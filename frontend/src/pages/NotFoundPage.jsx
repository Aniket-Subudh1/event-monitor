import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import Button from '../components/common/Button/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
          Page not found
        </h2>
        <p className="mt-6 text-base text-gray-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-10 flex justify-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
            icon={<ArrowLeft size={16} />}
          >
            Go back
          </Button>
          <Button
            as={Link}
            to="/"
            icon={<Home size={16} />}
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
import React from 'react';
import { InformationCircleIcon, ExclamationTriangleIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { CONFIG } from '@/lib/constants';
import { formatTimeRemaining } from '@/lib/utils';

interface DisclaimerProps {
  isRateLimited?: boolean;
  remaining?: number;
  resetTime?: number;
}

// Check if we're in development mode
const isDevelopment = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname === '0.0.0.0' ||
         process.env.NODE_ENV === 'development';
};

const Disclaimer: React.FC<DisclaimerProps> = ({ 
  isRateLimited = false, 
  remaining = CONFIG.RATE_LIMIT.MAX_REQUESTS,
  resetTime = Date.now() 
}) => {
  const isInDevelopment = isDevelopment();
  
  if (isRateLimited) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              Daily Limit Reached
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              You&apos;ve used all {CONFIG.RATE_LIMIT.MAX_REQUESTS} daily requests. The limit resets in{' '}
              <strong>{formatTimeRemaining(resetTime)}</strong>.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Want unlimited access?</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={CONFIG.CONTACT.LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Contact me on LinkedIn
                </a>
                <a
                  href={CONFIG.CONTACT.GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  Get the source code
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Development mode disclaimer
  if (isInDevelopment) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-start space-x-3">
          <CodeBracketIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
              Development Mode
            </h3>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
              <p>
                <strong>Unlimited requests</strong> available in development mode. 
                This application is for <strong>informational and entertainment purposes only</strong>.
              </p>
              <p>
                In production, users get {CONFIG.RATE_LIMIT.MAX_REQUESTS} requests per day to manage OpenAI costs.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Production disclaimer
  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-start space-x-3">
        <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Disclaimer
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p>
              This application is for <strong>informational and entertainment purposes only</strong>. 
              AI responses are generated based on Reddit discussions and should not be considered 
              professional advice.
            </p>
            <p>
              <strong>Rate Limit:</strong> {remaining} of {CONFIG.RATE_LIMIT.MAX_REQUESTS} daily requests remaining. Feel free to contact me on LinkedIn or fork GitHub repo and use your own OpenAI key.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer; 
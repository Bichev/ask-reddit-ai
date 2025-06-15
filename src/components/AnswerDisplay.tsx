import React, { useState } from 'react';
import { 
  LinkIcon, 
  SparklesIcon, 
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon 
} from '@heroicons/react/24/outline';
import { cn, formatNumber } from '@/lib/utils';
import type { AIResponse } from '@/types';

interface AnswerDisplayProps {
  answer: AIResponse;
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answer }) => {
  const [showSources, setShowSources] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  // Format the answer text with better readability
  const formatAnswer = (text: string) => {
    return text
      .split('\n\n')
      .map((paragraph, index) => {
        if (paragraph.trim() === '') return null;
        
        // Check if paragraph is a list
        if (paragraph.includes('•') || paragraph.includes('-') || /^\d+\./.test(paragraph.trim())) {
          const items = paragraph.split('\n').filter(item => item.trim());
          return (
            <ul key={index} className="space-y-2 mb-4 pl-4">
              {items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {item.replace(/^[•\-\d+\.]\s*/, '')}
                </li>
              ))}
            </ul>
          );
        }
        
        // Regular paragraph
        return (
          <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {paragraph}
          </p>
        );
      })
      .filter(Boolean);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Answer Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Analysis
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Based on recent Reddit discussions
            </p>
          </div>
        </div>
        
        {/* Confidence Badge */}
        <div className="flex items-center space-x-2">
          <span className={cn("text-sm font-medium", getConfidenceColor(answer.confidence))}>
            {getConfidenceLabel(answer.confidence)} Confidence
          </span>
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-300", {
                'bg-green-500': answer.confidence >= 0.8,
                'bg-yellow-500': answer.confidence >= 0.6 && answer.confidence < 0.8,
                'bg-orange-500': answer.confidence < 0.6,
              })}
              style={{ width: `${answer.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Answer Content */}
      <div className="prose prose-sm max-w-none">
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
          {formatAnswer(answer.answer)}
        </div>
      </div>

      {/* Sources Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => setShowSources(!showSources)}
          className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-2">
            <LinkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Sources ({answer.sources.length})
            </span>
          </div>
          {showSources ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showSources && (
          <div className="mt-3 space-y-2 animate-fade-in">
            {answer.sources.map((source, index) => (
              <div key={index} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {source.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Type: {source.type}
                    </p>
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => setShowMetadata(!showMetadata)}
          className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-2">
            <InformationCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Technical Details
            </span>
          </div>
          {showMetadata ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showMetadata && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg animate-fade-in">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Model:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {answer.model}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Confidence:</span>
                <span className={cn("ml-2 font-medium", getConfidenceColor(answer.confidence))}>
                  {Math.round(answer.confidence * 100)}%
                </span>
              </div>
              {answer.tokens_used && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Tokens Used:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {formatNumber(answer.tokens_used)}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-500 dark:text-gray-400">Sources:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {answer.sources.length} references
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Disclaimer:</strong> This answer is generated by AI based on Reddit discussions and should be considered as informational guidance rather than professional advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerDisplay; 
import React from 'react';
import { FireIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { TrendingQuestion } from '@/types';

interface TrendingQuestionsProps {
  questions: TrendingQuestion[];
  onQuestionSelect: (question: string, subreddit: string) => void;
}

const TrendingQuestions: React.FC<TrendingQuestionsProps> = ({
  questions,
  onQuestionSelect,
}) => {
  const getPopularityColor = (popularity: number) => {
    if (popularity >= 90) return 'text-red-500';
    if (popularity >= 80) return 'text-orange-500';
    if (popularity >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPopularityIcon = (popularity: number) => {
    if (popularity >= 90) return '🔥';
    if (popularity >= 80) return '⚡';
    if (popularity >= 70) return '📈';
    return '💡';
  };

  return (
    <div className="space-y-4">
      {questions.map((item, index) => (
        <div
          key={item.id}
          className="group cursor-pointer"
          onClick={() => onQuestionSelect(item.question, item.subreddit)}
        >
          <div className="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 hover:shadow-md group-hover:scale-[1.02]">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {getPopularityIcon(item.popularity)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  r/{item.subreddit}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <FireIcon className={cn("w-4 h-4", getPopularityColor(item.popularity))} />
                <span className={cn("text-xs font-bold", getPopularityColor(item.popularity))}>
                  {item.popularity}%
                </span>
              </div>
            </div>

            {/* Question */}
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.question}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                >
                  <HashtagIcon className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Hover indicator */}
            <div className="mt-3 flex items-center text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Click to ask this question</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {questions.length === 0 && (
        <div className="text-center py-8">
          <FireIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No trending questions available
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 mb-2">
          <FireIcon className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Trending Now
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          These questions are currently popular and getting great AI-powered answers from our community.
        </p>
      </div>
    </div>
  );
};

export default TrendingQuestions; 
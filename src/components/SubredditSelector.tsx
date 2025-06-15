import React, { useState } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { PopularSubreddit } from '@/types';

interface SubredditSelectorProps {
  selectedSubreddit: string;
  customSubreddit: string;
  onSubredditChange: (subreddit: string) => void;
  onCustomSubredditChange: (customSubreddit: string) => void;
  popularSubreddits: PopularSubreddit[];
}

const SubredditSelector: React.FC<SubredditSelectorProps> = ({
  selectedSubreddit,
  customSubreddit,
  onSubredditChange,
  onCustomSubredditChange,
  popularSubreddits,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubreddits = popularSubreddits.filter(subreddit =>
    subreddit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subreddit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubredditSelect = (subreddit: string) => {
    onSubredditChange(subreddit);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const getDisplayText = () => {
    if (selectedSubreddit === 'custom') {
      return customSubreddit ? `r/${customSubreddit}` : 'Enter custom subreddit...';
    }
    return `r/${selectedSubreddit}`;
  };

  const getSelectedSubredditInfo = () => {
    if (selectedSubreddit === 'custom') return null;
    return popularSubreddits.find(sub => sub.name === selectedSubreddit);
  };

  const selectedInfo = getSelectedSubredditInfo();

  return (
    <div className="space-y-4">
      {/* Dropdown Selector */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 text-left",
            "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600",
            "border border-gray-300 dark:border-gray-600 rounded-lg",
            "transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          )}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              r/
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {getDisplayText()}
              </p>
              {selectedInfo && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedInfo.description}
                </p>
              )}
            </div>
          </div>
          <ChevronDownIcon 
            className={cn(
              "w-5 h-5 text-gray-400 transition-transform duration-200",
              isDropdownOpen && "rotate-180"
            )} 
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg animate-fade-in">
            {/* Search Bar */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subreddits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Subreddit List */}
            <div className="max-h-64 overflow-y-auto">
              {/* Custom Subreddit Option */}
              <button
                onClick={() => handleSubredditSelect('custom')}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                  selectedSubreddit === 'custom' && "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500"
                )}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  +
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Custom Subreddit
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter any subreddit name
                  </p>
                </div>
              </button>

              {/* Popular Subreddits */}
              {filteredSubreddits.map((subreddit) => (
                <button
                  key={subreddit.name}
                  onClick={() => handleSubredditSelect(subreddit.name)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                    selectedSubreddit === subreddit.name && "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500"
                  )}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    r/
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        r/{subreddit.name}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {subreddit.subscribers}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {subreddit.description}
                    </p>
                  </div>
                </button>
              ))}

              {/* No Results */}
              {filteredSubreddits.length === 0 && searchTerm && (
                <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  No subreddits found matching &ldquo;{searchTerm}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Subreddit Input */}
      {selectedSubreddit === 'custom' && (
        <div className="animate-slide-in">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter Subreddit Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={customSubreddit}
              onChange={(e) => onCustomSubredditChange(e.target.value.replace(/^r\//, ''))}
              placeholder="programming"
              className="w-full px-4 py-3 pr-12 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              r/
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter the subreddit name without "r/" prefix
          </p>
        </div>
      )}

      {/* Selected Subreddit Info */}
      {selectedInfo && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                r/{selectedInfo.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {selectedInfo.description}
              </p>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {selectedInfo.subscribers} members
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubredditSelector; 
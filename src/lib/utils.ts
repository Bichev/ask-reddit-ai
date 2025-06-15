import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VALIDATION, ERROR_MESSAGES } from './constants';
import type { AppError, RedditPost, RedditComment } from '@/types';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validate subreddit name
 */
export function validateSubreddit(subreddit: string): { isValid: boolean; error?: string } {
  if (!subreddit) {
    return { isValid: false, error: 'Subreddit name is required' };
  }

  if (subreddit.length < VALIDATION.SUBREDDIT.MIN_LENGTH) {
    return { isValid: false, error: 'Subreddit name is too short' };
  }

  if (subreddit.length > VALIDATION.SUBREDDIT.MAX_LENGTH) {
    return { isValid: false, error: 'Subreddit name is too long' };
  }

  if (!VALIDATION.SUBREDDIT.PATTERN.test(subreddit)) {
    return { isValid: false, error: 'Subreddit name can only contain letters, numbers, and underscores' };
  }

  return { isValid: true };
}

/**
 * Validate question
 */
export function validateQuestion(question: string): { isValid: boolean; error?: string } {
  if (!question || question.trim().length === 0) {
    return { isValid: false, error: 'Question is required' };
  }

  const trimmedQuestion = question.trim();

  if (trimmedQuestion.length < VALIDATION.QUESTION.MIN_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.QUESTION_TOO_SHORT };
  }

  if (trimmedQuestion.length > VALIDATION.QUESTION.MAX_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.QUESTION_TOO_LONG };
  }

  return { isValid: true };
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Format number with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Clean and prepare Reddit post text for AI processing
 */
export function cleanRedditText(text: string): string {
  return text
    // Remove markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, '[URL]')
    // Remove Reddit-specific formatting
    .replace(/\/r\/[a-zA-Z0-9_]+/g, '[SUBREDDIT]')
    .replace(/\/u\/[a-zA-Z0-9_]+/g, '[USER]')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Extract meaningful content from Reddit posts and comments
 */
export function extractRedditContent(posts: RedditPost[], comments: RedditComment[]): string {
  const postContent = posts
    .filter(post => post.selftext && post.selftext.length > 50)
    .slice(0, 10) // Limit to top 10 posts
    .map(post => {
      const title = post.title;
      const content = cleanRedditText(post.selftext);
      const score = post.score;
      return `POST (${score} upvotes): ${title}\n${content}`;
    })
    .join('\n\n---\n\n');

  const commentContent = comments
    .filter(comment => comment.body && comment.body.length > 30 && comment.score > 0)
    .slice(0, 15) // Limit to top 15 comments
    .map(comment => {
      const content = cleanRedditText(comment.body);
      const score = comment.score;
      return `COMMENT (${score} upvotes): ${content}`;
    })
    .join('\n\n---\n\n');

  return [postContent, commentContent].filter(Boolean).join('\n\n===POSTS_END===\n\n');
}

/**
 * Generate a unique ID for answers
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Debounce function for input handling
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Handle API errors and return user-friendly messages
 */
export function handleApiError(error: any): AppError {
  if (error?.response?.status === 404) {
    return {
      message: ERROR_MESSAGES.SUBREDDIT_NOT_FOUND,
      type: 'reddit_api',
      details: error,
    };
  }

  if (error?.response?.status === 429) {
    return {
      message: ERROR_MESSAGES.RATE_LIMIT,
      type: 'network',
      details: error,
    };
  }

  if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      type: 'network',
      details: error,
    };
  }

  if (error?.message?.includes('OpenAI')) {
    return {
      message: ERROR_MESSAGES.OPENAI_ERROR,
      type: 'openai_api',
      details: error,
    };
  }

  return {
    message: error?.message || ERROR_MESSAGES.GENERIC_ERROR,
    type: 'unknown',
    details: error,
  };
}

/**
 * Save data to localStorage safely
 */
export function saveToLocalStorage(key: string, data: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * Load data from localStorage safely
 */
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Format text for sharing
 */
export function formatForSharing(question: string, subreddit: string, answer: string): string {
  const header = `🤖 AI Answer from r/${subreddit}`;
  const questionLine = `❓ Q: ${question}`;
  const answerLine = `💡 A: ${truncateText(answer, 200)}`;
  const footer = `\n\nGenerated by Ask Reddit AI`;
  
  return `${header}\n\n${questionLine}\n\n${answerLine}${footer}`;
}

/**
 * Create a shareable URL for Twitter
 */
export function createTwitterUrl(text: string): string {
  const encodedText = encodeURIComponent(text);
  return `https://twitter.com/intent/tweet?text=${encodedText}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
} 
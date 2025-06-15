import { NextRequest, NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';
import { CONFIG } from '@/lib/constants';
import { handleApiError } from '@/lib/utils';
import type { RedditDataRequest, RedditDataResponse, RedditPost, RedditComment } from '@/types';

// Initialize Reddit API client
const reddit = new Snoowrap({
  userAgent: 'ask-reddit-ai',
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN!,
});

/**
 * Convert Snoowrap submission to our RedditPost interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformSubmission(submission: any): RedditPost {
  return {
    id: submission.id,
    title: submission.title,
    selftext: submission.selftext || '',
    author: submission.author?.name || '[deleted]',
    score: submission.score,
    num_comments: submission.num_comments,
    created_utc: submission.created_utc,
    url: submission.url,
    subreddit: submission.subreddit?.display_name || '',
    permalink: submission.permalink,
    upvote_ratio: submission.upvote_ratio || 0,
  };
}

/**
 * Convert Snoowrap comment to our RedditComment interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformComment(comment: any, depth: number = 0): RedditComment {
  const baseComment: RedditComment = {
    id: comment.id,
    body: comment.body || '',
    author: comment.author?.name || '[deleted]',
    score: comment.score || 0,
    created_utc: comment.created_utc,
    depth,
  };

  // Add replies if they exist
  if (comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0) {
    baseComment.replies = comment.replies
      .slice(0, 3)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((reply: any) => transformComment(reply, depth + 1));
  }

  return baseComment;
}

/**
 * Fetch recent posts and comments from a subreddit
 */
async function fetchSubredditData(subreddit: string, timeframe: string, limit: number) {
  try {
    // Fetch top posts from the specified timeframe
    const timeMap = {
      '24h': 'day',
      '48h': 'day', // Reddit API doesn't have 48h, so we use day
      'week': 'week',
    } as const;

    const posts = await reddit
      .getSubreddit(subreddit)
      .getTop({ time: timeMap[timeframe as keyof typeof timeMap] || 'day', limit });

    const transformedPosts: RedditPost[] = posts.map(transformSubmission);

    // Fetch comments from the most popular posts
    const comments: RedditComment[] = [];
    const postsWithComments = transformedPosts.slice(0, 5); // Get comments from top 5 posts

    for (const post of postsWithComments) {
      try {
        const submission = reddit.getSubmission(post.id);
        // @ts-expect-error - Known snoowrap type issue with circular references
        const expandedSubmission = await submission.expandReplies({ limit: 10, depth: 2 });
        
        const postComments = expandedSubmission.comments
          .slice(0, 10) // Limit comments per post
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((comment: any) => transformComment(comment))
          .filter((comment: RedditComment) => 
            comment.body && 
            comment.body !== '[deleted]' && 
            comment.body !== '[removed]' &&
            comment.score > 0
          );

        comments.push(...postComments);
      } catch (error) {
        console.error(`Error fetching comments for post ${post.id}:`, error);
        // Continue with other posts even if one fails
      }
    }

    return {
      posts: transformedPosts,
      comments: comments.sort((a, b) => b.score - a.score), // Sort by score
      subreddit,
      fetchedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching subreddit data:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RedditDataRequest = await request.json();
    const { subreddit, timeframe = CONFIG.REDDIT.DEFAULT_TIMEFRAME, limit = CONFIG.REDDIT.DEFAULT_LIMIT } = body;

    if (!subreddit) {
      return NextResponse.json(
        { success: false, error: 'Subreddit name is required' },
        { status: 400 }
      );
    }

    // Validate limit
    const validatedLimit = Math.min(Math.max(limit, 1), CONFIG.REDDIT.MAX_LIMIT);

    const data = await fetchSubredditData(subreddit, timeframe, validatedLimit);

    const response: RedditDataResponse = {
      success: true,
      data,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Reddit API Error:', error);
    
    const appError = handleApiError(error);
    const response: RedditDataResponse = {
      success: false,
      error: appError.message,
    };

    // Return appropriate HTTP status based on error type
    let status = 500;
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404 || 
        (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('not found'))) {
      status = 404;
    } else if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403 || 
               (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('private'))) {
      status = 403;
    } else if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 429) {
      status = 429;
    }

    return NextResponse.json(response, { status });
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Simple test to verify Reddit API connection
    // @ts-expect-error - Known snoowrap type issue with circular references
    await reddit.getSubreddit('test').fetch();
    
    return NextResponse.json({
      success: true,
      message: 'Reddit API connection successful',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Reddit API Health Check Failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Reddit API connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 
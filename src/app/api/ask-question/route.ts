import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CONFIG } from '@/lib/constants';
import { handleApiError, extractRedditContent } from '@/lib/utils';
import type { AskQuestionRequest, AskQuestionResponse, AIResponse } from '@/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Generate AI response based on Reddit data and user question
 */
async function generateAIResponse(
  question: string,
  redditContent: string,
  subreddit: string,
  model: 'gpt-4' | 'gpt-3.5-turbo'
): Promise<AIResponse> {
  const systemPrompt = `You are an AI assistant that analyzes Reddit discussions and provides comprehensive, well-structured answers to user questions.

Your task is to:
1. Analyze the provided Reddit posts and comments from r/${subreddit}
2. Synthesize the information to answer the user's question
3. Provide a balanced, informative response based on the community discussions
4. Include relevant insights, trends, and perspectives from the Reddit content
5. Be objective and acknowledge different viewpoints when they exist

Guidelines:
- Focus on factual information and community consensus
- Highlight interesting insights or unique perspectives
- If there are conflicting opinions, present multiple viewpoints
- Keep your response structured and easy to read
- Don't make assumptions beyond what's discussed in the Reddit content
- If the Reddit content doesn't adequately address the question, mention this limitation

Format your response in a clear, readable manner with appropriate paragraphs.`;

  const userPrompt = `Question: ${question}

Reddit Content from r/${subreddit}:
${redditContent}

Please provide a comprehensive answer based on the Reddit discussions above.`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: CONFIG.OPENAI.MAX_TOKENS,
      temperature: CONFIG.OPENAI.TEMPERATURE,
    });

    const answer = completion.choices[0]?.message?.content || 'No response generated';
    
    // Extract sources from the content (simplified - could be enhanced)
    const sources = [
      {
        title: `Recent discussions in r/${subreddit}`,
        url: `https://reddit.com/r/${subreddit}`,
        type: 'post' as const,
      },
    ];

    return {
      answer,
      sources,
      confidence: 0.85, // This could be calculated based on content quality
      model,
      tokens_used: completion.usage?.total_tokens,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AskQuestionRequest = await request.json();
    const { subreddit, question, model = CONFIG.OPENAI.DEFAULT_MODEL } = body;

    if (!subreddit || !question) {
      return NextResponse.json(
        { success: false, error: 'Subreddit and question are required' },
        { status: 400 }
      );
    }

    // Validate model
    if (!['gpt-4', 'gpt-3.5-turbo'].includes(model)) {
      return NextResponse.json(
        { success: false, error: 'Invalid model specified' },
        { status: 400 }
      );
    }

    // First, fetch Reddit data
    const redditResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/reddit-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subreddit,
        timeframe: '24h',
        limit: 25,
      }),
    });

    if (!redditResponse.ok) {
      const errorData = await redditResponse.json();
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to fetch Reddit data' },
        { status: redditResponse.status }
      );
    }

    const redditData = await redditResponse.json();
    
    if (!redditData.success || !redditData.data) {
      return NextResponse.json(
        { success: false, error: 'No Reddit data available for this subreddit' },
        { status: 404 }
      );
    }

    // Extract and prepare content for AI processing
    const redditContent = extractRedditContent(
      redditData.data.posts,
      redditData.data.comments
    );

    if (!redditContent || redditContent.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Insufficient recent content in this subreddit' },
        { status: 404 }
      );
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(question, redditContent, subreddit, model);

    const response: AskQuestionResponse = {
      success: true,
      data: aiResponse,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Ask Question API Error:', error);
    
    const appError = handleApiError(error);
    const response: AskQuestionResponse = {
      success: false,
      error: appError.message,
    };

    // Return appropriate HTTP status based on error type
    let status = 500;
    if (error && typeof error === 'object' && 'code' in error && error.code === 'insufficient_quota' || 
        (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('quota'))) {
      status = 429;
    } else if (error && typeof error === 'object' && 'status' in error && error.status === 401 || 
               (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('API key'))) {
      status = 401;
    }

    return NextResponse.json(response, { status });
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Simple test to verify OpenAI API connection
    const testCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    });
    
    return NextResponse.json({
      success: true,
      message: 'OpenAI API connection successful',
      model: testCompletion.model,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('OpenAI API Health Check Failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'OpenAI API connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 
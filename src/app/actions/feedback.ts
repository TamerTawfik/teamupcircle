'use server';

import { prisma } from "@/lib/prisma";
import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from "@/auth";

// Rate limiting implementation
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

interface RateLimitEntry {
  count: number;
  timestamp: number;
}

const rateLimitCache = new Map<string, RateLimitEntry>();

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitCache.get(identifier);

  if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitCache.set(identifier, { count: 1, timestamp: now });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  rateLimitCache.set(identifier, entry);
  return false;
}

// Validation schema
const feedbackSchema = z.object({
  feedback: z.string().min(3, 'Feedback must be at least 3 characters').max(1000, 'Feedback cannot exceed 1000 characters'),
  pageUrl: z.string().url('Invalid URL').optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

export interface FeedbackResponse {
  success: boolean;
  message: string;
}

export async function submitFeedback(formData: FormData): Promise<FeedbackResponse> {
    const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      message: "Not authenticated"
    };
  }
  try {
    // Get client IP and user agent for rate limiting
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    const referer = headersList.get('referer') || '';
    
    // Check rate limiting
    const rateLimitKey = `${ipAddress}:${userAgent}`;
    if (isRateLimited(rateLimitKey)) {
      return {
        success: false,
        message: 'Too many requests. Please try again later.',
      };
    }

    // Extract and validate form data
    const rawFeedback = formData.get('feedback');
    const pageUrl = formData.get('pageUrl') as string || referer;
    
    if (typeof rawFeedback !== 'string') {
      return {
        success: false,
        message: 'Invalid feedback format',
      };
    }

    const validationResult = feedbackSchema.safeParse({ 
      feedback: rawFeedback,
      pageUrl
    });
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0]?.message || 'Invalid feedback';
      return {
        success: false,
        message: errorMessage,
      };
    }

    // Store feedback in database
    await prisma.feedback.create({
      data: {
        content: validationResult.data.feedback,
        pageUrl: validationResult.data.pageUrl,
        userAgent,
        ipAddress,
        userId: session.user.id,
        userEmail: session.user.email!,
      },
    });

    // Revalidate the page to reflect changes
    revalidatePath('/');

    return {
      success: true,
      message: 'Feedback submitted successfully',
    };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Middleware generator to validate request bodies with Zod
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.issues.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: formattedErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

// User & Auth Schemas
export const registerSchema = z.object({
  phone: z.string().min(6, 'Phone number must be at least 6 digits').max(20),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  target_university: z.string().optional().default('buet'),
  exam_year: z.string().optional().default('2025'),
});

export const loginSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Admin password is required'),
});

export const userProfileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  target_university: z.string().optional(),
  exam_year: z.string().optional(),
  avatar_seed: z.string().optional(),
  avatar_bg_color: z.string().optional(),
});

// Question & Topic Mutation Schemas
export const questionOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

export const questionCreateUpdateSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  paper: z.number().int().min(1).max(2).optional().default(1),
  chapterId: z.string().min(1, 'Chapter ID is required'),
  topic: z.string().optional().default(''),
  questionText: z.string().min(1, 'Question text is required'),
  questionType: z.enum(['mcq', 'written']).optional().default('mcq'),
  options: z.array(questionOptionSchema).optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  explanation: z.string().optional().default(''),
  university: z.string().optional().default(''),
  year: z.string().optional().default(''),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  tags: z.array(z.string()).optional().default([]),
});

export const batchQuestionsCreateSchema = z.object({
  questions: z.array(questionCreateUpdateSchema).min(1, 'At least 1 question is required'),
});

export const draftCreateSchema = z.object({
  source: z.string().optional().default('manual'),
  chapterId: z.string().optional(),
  subject: z.string().optional(),
  content: z.record(z.string(), z.any()),
});

export const draftReviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reviewedContent: z.record(z.string(), z.any()).optional(),
});

// AI Request Schemas
export const aiChatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
  context: z.record(z.string(), z.any()).optional(),
});

export const aiExplainQuestionSchema = z.object({
  question: questionCreateUpdateSchema.partial().extend({
    questionText: z.string().min(1),
    correctAnswer: z.string().min(1),
  }),
  userSelectedAns: z.string().optional(),
});

export const aiSolvePhotoSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
  prompt: z.string().optional(),
});

export const adminApiKeySaveSchema = z.object({
  keys: z.array(
    z.object({
      id: z.string().min(1),
      provider: z.string().min(1),
      label: z.string().min(1),
      key_full: z.string().optional(),
      key_masked: z.string().optional(),
      priority: z.number().int().optional(),
      is_active: z.boolean().optional(),
      model: z.string().optional(),
    })
  ),
});

export const adminApiKeyTestSchema = z.object({
  key: z.string().min(1, 'Key is required to test'),
  provider: z.string().optional().default('openrouter'),
  model: z.string().optional().default('anthropic/claude-3.5-sonnet'),
});

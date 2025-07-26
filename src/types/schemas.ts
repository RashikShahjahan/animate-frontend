import { z } from 'zod';

/**
 * Zod schemas for API validation
 */

// Animation schemas
export const AnimationRequestSchema = z.object({
  description: z.string().min(1, 'Description is required')
});

export const AnimationResponseSchema = z.object({
  code: z.string().min(1, 'Animation code is required'),
  metadata: z.object({
    functions: z.record(z.boolean()).optional(),
    hasSetup: z.boolean().optional(),
    hasDraw: z.boolean().optional(),
    hasInteraction: z.boolean().optional(),
    hasCanvas: z.boolean().optional(),
    canvasWidth: z.string().optional(),
    canvasHeight: z.string().optional(),
    usesShapes: z.boolean().optional(),
    uses3D: z.boolean().optional(),
    usesImages: z.boolean().optional(),
    errors: z.array(z.string()).optional(),
    isValid: z.boolean().optional()
  }).optional(),
  error: z.string().optional()
});

export const SaveAnimationRequestSchema = z.object({
  code: z.string().min(1, 'Animation code is required'),
  description: z.string().min(1, 'Description is required')
});

export const SaveAnimationResponseSchema = z.object({
  id: z.string().min(1, 'Animation ID is required')
});

export const GetAnimationRequestSchema = z.object({
  id: z.string().min(1, 'Animation ID is required')
});

export const GetAnimationResponseSchema = z.object({
  id: z.string().min(1, 'Animation ID is required'),
  code: z.string().min(1, 'Animation code is required'),
  description: z.string()
});

export const GetAnimationFeedResponseSchema = z.array(GetAnimationResponseSchema);

// Authentication schemas
export const RegisterRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const RegisterResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string().email()
  })
});

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string().email()
  })
});

// Claude API schemas
export const ClaudeMessageSchema = z.object({
  role: z.string(),
  content: z.string()
});

export const ClaudeRequestSchema = z.object({
  model: z.string(),
  messages: z.array(ClaudeMessageSchema),
  max_tokens: z.number(),
  temperature: z.number()
});

export const ClaudeContentSchema = z.object({
  type: z.string(),
  text: z.string()
});

export const ClaudeResponseSchema = z.object({
  content: z.array(ClaudeContentSchema)
});

// Schema for saving mood feedback
export const SaveMoodRequestSchema = z.object({
  animationId: z.string(),
  mood: z.enum(['much worse', 'worse', 'same', 'better', 'much better']),
});

export const SaveMoodResponseSchema = z.object({
  success: z.boolean(),
});

// Type inference from schemas
export type AnimationRequest = z.infer<typeof AnimationRequestSchema>;
export type AnimationResponse = z.infer<typeof AnimationResponseSchema>;
export type SaveAnimationRequest = z.infer<typeof SaveAnimationRequestSchema>;
export type SaveAnimationResponse = z.infer<typeof SaveAnimationResponseSchema>;
export type GetAnimationRequest = z.infer<typeof GetAnimationRequestSchema>;
export type GetAnimationResponse = z.infer<typeof GetAnimationResponseSchema>;
export type GetAnimationFeedResponse = z.infer<typeof GetAnimationFeedResponseSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type ClaudeMessage = z.infer<typeof ClaudeMessageSchema>;
export type ClaudeRequest = z.infer<typeof ClaudeRequestSchema>;
export type ClaudeContent = z.infer<typeof ClaudeContentSchema>;
export type ClaudeResponse = z.infer<typeof ClaudeResponseSchema>;
export type SaveMoodRequest = z.infer<typeof SaveMoodRequestSchema>;
export type SaveMoodResponse = z.infer<typeof SaveMoodResponseSchema>; 
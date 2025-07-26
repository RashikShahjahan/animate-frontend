/**
 * API Types for animation generation services
 */

export interface AnimationRequest {
  description: string;
}

export interface AnimationResponse {
  code: string;
  metadata?: {
    functions?: { [key: string]: boolean };
    hasSetup?: boolean;
    hasDraw?: boolean;
    hasInteraction?: boolean;
    hasCanvas?: boolean;
    canvasWidth?: string;
    canvasHeight?: string;
    usesShapes?: boolean;
    uses3D?: boolean;
    usesImages?: boolean;
    errors?: string[];
    isValid?: boolean;
  };
  error?: string;
}

export interface SaveAnimationRequest {
  description: string;
  code: string;
}

export interface SaveAnimationResponse {
  id: string;
}

export interface GetAnimationResponse {
  id: string;
  code: string;
  description: string;
} 

export interface GetAnimationRequest {
  id: string;
}



export interface User {
  id: string;
  username: string;
  email: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}


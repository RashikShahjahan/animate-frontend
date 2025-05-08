/**
 * API Types for animation generation services
 */

export interface AnimationRequest {
  description: string;
}

export interface AnimationResponse {
  code: string;
}

export interface SaveAnimationRequest {
  description: string;
  code: string;
}

export interface SaveAnimationResponse {
  id: string;
}

export interface GetAnimationResponse {
  code: string;
  description?: string;
} 

export interface GetAnimationRequest {
  id: string;
}

export interface FixAnimationRequest {
  broken_code: string;
  error_message: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  }
} 
/**
 * API functions for animation generation
 */
import axios from 'axios';
import { isZodError, formatZodError } from '../utils/validation';
import {
  AnimationRequest,
  AnimationResponse,
  SaveAnimationRequest,
  SaveAnimationResponse,
  GetAnimationRequest,
  GetAnimationResponse,
  FixAnimationRequest,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ClaudeRequest,
  ClaudeResponse,

} from '../types/schemas';

import {
  AnimationRequestSchema,
  AnimationResponseSchema,
  SaveAnimationRequestSchema,
  SaveAnimationResponseSchema,
  GetAnimationRequestSchema,
  GetAnimationResponseSchema,
  RegisterRequestSchema,
  RegisterResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  ClaudeRequestSchema,
  ClaudeResponseSchema
} from '../types/schemas';

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    // Add auth token to all requests except for specific endpoints
    const token = localStorage.getItem('auth_token');
    const isPublicEndpoint = config.url?.includes('/animation/');
    
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

// Use the exact BASE_URL from environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Log the base URL for debugging
console.log('BASE_URL:', BASE_URL);

// Helper function to handle errors consistently
const handleApiError = (error: unknown) => {
  // Handle Zod validation errors
  if (isZodError(error)) {
    const errorMessage = formatZodError(error);
    console.error('Validation error:', errorMessage);
    throw new Error(`Validation failed: ${errorMessage}`);
  }
  
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const errorData = error.response?.data;
    const errorMessage = errorData?.message || error.message || 'Unknown API error';
    
    console.error('API request failed:', {
      status,
      message: errorMessage,
      url: error.config?.url
    });
    
    throw new Error(`API request failed: ${errorMessage}`);
  }
  
  // For non-Axios errors
  console.error('Non-axios error:', error);
  throw error;
};

export const generateAnimation = async (inputText: AnimationRequest): Promise<AnimationResponse> => {
  try {
    // Validate request data
    const validatedData = AnimationRequestSchema.parse(inputText);
    
    const url = new URL('generate-animation', BASE_URL);
    const response = await axios.post(url.toString(), validatedData);
    
    // Validate response data
    return AnimationResponseSchema.parse(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}; 

export const saveAnimation = async (code: SaveAnimationRequest): Promise<SaveAnimationResponse> => {
  try {
    // Validate request data
    const validatedData = SaveAnimationRequestSchema.parse(code);
    
    const url = new URL('save-animation', BASE_URL);
    const response = await axios.post(url.toString(), validatedData);
    
    // Validate response data
    return SaveAnimationResponseSchema.parse(response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAnimation = async (id: GetAnimationRequest): Promise<GetAnimationResponse> => {
  try {
    // Validate request data
    const validatedData = GetAnimationRequestSchema.parse(id);
    
    const url = new URL(`animation/${validatedData.id}`, BASE_URL);
    const response = await axios.get(url.toString());
    
    // Validate response data
    return GetAnimationResponseSchema.parse(response.data);
  } catch (error) {
    return handleApiError(error);
  }
};


export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    // Validate request data
    const validatedData = RegisterRequestSchema.parse(data);
    
    const url = new URL('register', BASE_URL);
    const response = await axios.post(url.toString(), validatedData);

    // Validate response data
    return RegisterResponseSchema.parse(response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    // Validate request data
    const validatedData = LoginRequestSchema.parse(data);
    
    const url = new URL('login', BASE_URL);
    const response = await axios.post(url.toString(), validatedData);

    // Validate response data
    return LoginResponseSchema.parse(response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const sendClaudeRequest = async (request: ClaudeRequest): Promise<ClaudeResponse> => {
  try {
    // Validate request data
    const validatedData = ClaudeRequestSchema.parse(request);
    
    const url = new URL('claude', BASE_URL);
    const response = await axios.post(url.toString(), validatedData);
    
    // Validate response data
    return ClaudeResponseSchema.parse(response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

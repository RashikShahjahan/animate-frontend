/**
 * API functions for animation generation
 */
import axios from 'axios';
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
  LoginResponse
} from '../types/apiTypes';


// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
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
    const url = new URL('generate-animation', BASE_URL);
    const response = await axios.post(url.toString(), inputText);
    
    if (!response.data || !response.data.code) {
      throw new Error('Invalid response: Missing code in the animation response');
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}; 

export const saveAnimation = async (code: SaveAnimationRequest): Promise<SaveAnimationResponse> => {
  try {
    const url = new URL('save-animation', BASE_URL);
    const response = await axios.post(url.toString(), code);
    
    if (!response.data || !response.data.id) {
      throw new Error('Invalid response: Missing ID in save response');
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAnimation = async (id: GetAnimationRequest): Promise<GetAnimationResponse> => {
  try {
    const url = new URL(`animation/${id.id}`, BASE_URL);
    const response = await axios.get(url.toString());
    
    if (!response.data || !response.data.code) {
      throw new Error('Invalid response: Missing code in the animation data');
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fixAnimation = async (request: FixAnimationRequest): Promise<AnimationResponse> => {
  try {
    // Validate request data
    if (!request.broken_code) {
      throw new Error('No broken code provided for fixing');
    }
    
    console.log('Sending fix request:', {
      error_message: request.error_message,
      code_length: request.broken_code.length
    });
    
    const url = new URL('fix-animation', BASE_URL);
    const response = await axios.post(url.toString(), request);
    
    if (!response.data || !response.data.code) {
      throw new Error('Invalid response: Missing code in the fix response');
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const url = new URL('register', BASE_URL);
    const response = await axios.post(url.toString(), data);


    if (!response.data || !response.data.id) {
      throw new Error('Invalid response: Missing ID in register response');
    }

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const url = new URL('login', BASE_URL);
    const response = await axios.post(url.toString(), data);

    if (!response.data || !response.data.token) {
      throw new Error('Invalid response: Missing token in login response');
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

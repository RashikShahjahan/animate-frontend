/**
 * API functions for animation generation
 */
import axios from 'axios';

// Create a custom axios instance with logging
const apiClient = axios.create();

// Add a request interceptor to log requests
apiClient.interceptors.request.use(config => {
  console.log('Request URL:', config.url);
  console.log('Request Method:', config.method);
  return config;
});

interface AnimationRequest {
  description: string;
}

interface AnimationResponse {
  code: string;
}

interface SaveAnimationRequest {
  code: string;
}

interface SaveAnimationResponse {
  id: string;
}

interface GetAnimationResponse {
  code: string;
  description?: string;
} 

interface GetAnimationRequest {
  id: string;
}

interface FixAnimationRequest {
  broken_code: string;
  error_message: string;
}

const getBaseUrl = (): string => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  // Ensure the URL has a protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  
  // Remove trailing slash to avoid double slashes in API calls
  return url.replace(/\/+$/, '');
};

const BASE_URL = getBaseUrl();

// Log the base URL for debugging
console.log('BASE_URL:', BASE_URL);

// Helper function to handle errors consistently
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error('API request failed:', error.message, error.response?.status);
    throw new Error(`API request failed with status ${error.response?.status}`);
  }
  throw error;
};

export const generateAnimation = async (inputText: AnimationRequest): Promise<AnimationResponse> => {
  try {
    const url = new URL('generate-animation', BASE_URL);
    const response = await apiClient.post(url.toString(), inputText);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}; 

export const saveAnimation = async (code: SaveAnimationRequest): Promise<SaveAnimationResponse> => {
  try {
    const url = new URL('save-animation', BASE_URL);
    const response = await apiClient.post(url.toString(), code);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAnimation = async (id: GetAnimationRequest): Promise<GetAnimationResponse> => {
  try {
    const url = new URL(`animation/${id.id}`, BASE_URL);
    const response = await apiClient.get(url.toString());
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fixAnimation = async (request: FixAnimationRequest): Promise<GetAnimationResponse> => {
  try {
    const url = new URL('fix-animation', BASE_URL);
    const response = await apiClient.post(url.toString(), request);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
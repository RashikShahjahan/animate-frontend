/**
 * API functions for animation generation
 */
import axios from 'axios';

// Create a custom axios instance with logging
const apiClient = axios.create({
  timeout: 30000 // 30 second timeout
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

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
    const response = await apiClient.post(url.toString(), inputText);
    
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
    const response = await apiClient.post(url.toString(), code);
    
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
    const response = await apiClient.get(url.toString());
    
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
    const response = await apiClient.post(url.toString(), request);
    
    if (!response.data || !response.data.code) {
      throw new Error('Invalid response: Missing code in the fix response');
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
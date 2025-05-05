/**
 * API functions for animation generation
 */
import axios from 'axios';

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

interface fixAnimationRequest {
  broken_code: string;
  error_message: string;
}

const getAbsoluteUrl = (url: string): string => {
  // Ensure the URL has a protocol, otherwise it will be treated as relative
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url.replace(/^\/+/, '')}`;
  }
  return url;
};

const BASE_URL = getAbsoluteUrl((import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/?$/, '/'));

export const generateAnimation = async (inputText: AnimationRequest): Promise<AnimationResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/generate-animation`, inputText);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API request failed with status ${error.response?.status}`);
    }
    throw error;
  }
}; 

export const saveAnimation = async (code: SaveAnimationRequest): Promise<SaveAnimationResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/save-animation`, code);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API request failed with status ${error.response?.status}`);
    }
    throw error;
  }
};

export const getAnimation = async (id: GetAnimationRequest): Promise<GetAnimationResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/animation/${id.id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API request failed with status ${error.response?.status}`);
    }
    throw error;
  }
};

export const fixAnimation = async (fixAnimationRequest: fixAnimationRequest): Promise<GetAnimationResponse> => {
  try {
    // Create a URL object to ensure proper URL construction
    const url = new URL('fix-animation', BASE_URL);
    const response = await axios.post(url.toString(), fixAnimationRequest);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API request failed with status ${error.response?.status}`);
    }
    throw error;
  }
};
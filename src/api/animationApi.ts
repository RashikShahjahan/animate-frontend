/**
 * API functions for animation generation
 */

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

const BASE_URL = 'http://localhost:8080';

export const generateAnimation = async (inputText: AnimationRequest): Promise<AnimationResponse> => {
  const response = await fetch(`${BASE_URL}/generate-animation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inputText),
  });
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  return await response.json();
}; 

export const saveAnimation = async (code: SaveAnimationRequest): Promise<SaveAnimationResponse> => {
  const response = await fetch(`${BASE_URL}/save-animation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(code),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return await response.json();
};

export const getAnimation = async (id: GetAnimationRequest): Promise<GetAnimationResponse> => {
  const response = await fetch(`${BASE_URL}/animation/${id.id}`);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return await response.json();
};

export const fixAnimation = async (broken_code: string, error_message: string): Promise<GetAnimationResponse> => {
  const response = await fetch(`${BASE_URL}/fix-animation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ broken_code, error_message }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return await response.json();
};
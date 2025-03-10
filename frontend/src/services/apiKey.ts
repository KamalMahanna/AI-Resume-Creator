const API_KEY_STORAGE_KEY = 'gemini_api_key';

export const getStoredApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const storeApiKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
};

export const removeApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://ai-resume-creator-tmfr.onrender.com/validate-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};

// Simple client-side storage for generated images using localStorage

export interface GeneratedImage {
  id: string;
  prompt: string;
  enhancedPrompt?: string;
  url: string;           // URL만 저장
  timestamp: number;
}

const STORAGE_KEY = 'dallespace-images';

/**
 * Save a generated image to local storage
 */
export const saveImage = (image: Omit<GeneratedImage, 'id' | 'timestamp'>) => {
  const images = getAllImages();
  
  const newImage: GeneratedImage = {
    ...image,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newImage, ...images]));
  return newImage;
};

/**
 * Get all saved images from local storage
 */
export const getAllImages = (): GeneratedImage[] => {
  if (typeof window === 'undefined') return [];
  
  const imagesJSON = localStorage.getItem(STORAGE_KEY);
  if (!imagesJSON) return [];
  
  try {
    return JSON.parse(imagesJSON);
  } catch (error) {
    console.error('Failed to parse images from localStorage', error);
    return [];
  }
};

/**
 * Get a specific image by ID
 */
export const getImageById = (id: string): GeneratedImage | undefined => {
  return getAllImages().find(img => img.id === id);
};

/**
 * Delete an image by ID
 */
export const deleteImage = (id: string): boolean => {
  const images = getAllImages();
  const newImages = images.filter(img => img.id !== id);
  
  if (newImages.length === images.length) {
    return false; // Image not found
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newImages));
  return true;
};

/**
 * Clear all saved images
 */
export const clearAllImages = (): void => {
  localStorage.removeItem(STORAGE_KEY);
}; 
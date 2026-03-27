import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Uploads a base64 image string to Firebase Storage and returns the download URL.
 * @param base64Data The base64 encoded image data (with or without data:image/png;base64, prefix)
 * @param path The path where the image should be stored (e.g., 'visuals/image_id.png')
 */
export const uploadImage = async (base64Data: string, path: string): Promise<string> => {
  try {
    // Remove prefix if present
    const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    
    const storageRef = ref(storage, path);
    await uploadString(storageRef, base64Content, 'base64');
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    throw error;
  }
};

export const deleteImage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Error deleting image from storage (it might not exist):', error);
  }
};

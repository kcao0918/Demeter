/**
 * uploadService.ts
 * Utility functions for uploading files to backend with predefined folders
 */
import { updateDailyNutritionTotals } from "../utils/dailyNutrition";

interface UploadResponse {
  url: string;
  name: string;
  path: string;
}

/**
 * Core upload function that uploads a file to a specified folder for a user
 * @param file - File to upload
 * @param uid - User ID
 * @param folder - Folder path under user directory
 * @returns Promise with upload response
 */
const uploadToServer = async (
  file: File,
  uid: string,
  folder: string
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("uid", uid);
  formData.append("folder", folder); // send folder info to backend

  try {
    const res = await fetch("http://localhost:8080/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

/**
 * General helper to handle file upload with user validation and success/error callbacks
 */
const handleUpload = async (
  file: File | null,
  uid: string | null,
  folder: string,
  onSuccess?: (data: UploadResponse) => void,
  onError?: (error: string) => void
) => {
  if (!uid) {
    const msg = "You must be logged in.";
    onError?.(msg);
    alert(msg);
    return;
  }

  if (!file) {
    const msg = "Choose a file first.";
    onError?.(msg);
    alert(msg);
    return;
  }

  try {
    const data = await uploadToServer(file, uid, folder);
    const successMsg = `Upload successful! URL:\n${data.url}`;
    onSuccess?.(data);
    alert(successMsg);
  } catch (error: any) {
    const errorMsg = `Upload failed: ${error.message}`;
    onError?.(errorMsg);
    alert(errorMsg);
  }
};

/**
 * Upload functions for specific folders
 */
export const uploadUserFridgeImage = (file: File | null, uid: string | null, onSuccess?: (data: UploadResponse) => void, onError?: (error: string) => void) =>
  handleUpload(file, uid, "images/fridge", onSuccess, onError);

export const uploadUserMedicalReport = (file: File | null, uid: string | null, onSuccess?: (data: UploadResponse) => void, onError?: (error: string) => void) =>
  handleUpload(file, uid, "images/medical_report", onSuccess, onError);

export const uploadUserInputFile = (file: File | null, uid: string | null, onSuccess?: (data: UploadResponse) => void, onError?: (error: string) => void) =>
  handleUpload(file, uid, "files/input", onSuccess, onError);

export const uploadBookmarkedRecipe = (file: File | null, uid: string | null, onSuccess?: (data: UploadResponse) => void, onError?: (error: string) => void) =>
  handleUpload(file, uid, "recipes/bookmarked", onSuccess, onError);

export const uploadPatientSetupInfo = (file: File | null, uid: string | null, onSuccess?: (data: UploadResponse) => void, onError?: (error: string) => void) =>
  handleUpload(file, uid, "healthdata", onSuccess, onError);

export const uploadSavedRecipe = async (file: File | null, uid: string | null, onSuccess?: (data: UploadResponse) => void, onError?: (error: string) => void) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateFolder = `${yyyy}-${mm}-${dd}`;

  const folder = `recipes/saved/${dateFolder}`;
  
  const data = await handleUpload(file, uid, folder, onSuccess, onError);

  // Update daily totals after upload
  if (uid) {
    updateDailyNutritionTotals(uid).catch(err =>
      console.error("Failed to update daily totals:", err)
    );
  }

  return data;
};

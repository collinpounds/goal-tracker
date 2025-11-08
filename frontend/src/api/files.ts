/**
 * API service for goal file operations
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '../lib/supabase';
import {
  GoalFile,
  GoalFileUploadResponse,
  FileDownloadResponse,
  FILE_UPLOAD_CONSTRAINTS,
} from '../types/file.types';

const API_URL = import.meta.env.VITE_API_URL || '';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get current session from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Add Authorization header if session exists
      if (session?.access_token && config.headers) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }

      return config;
    } catch (error) {
      console.error('Error getting session for API request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      console.warn('Unauthorized request, redirecting to login...');

      // Clear the Supabase session
      await supabase.auth.signOut();

      // Redirect to login page
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

/**
 * Get all files for a goal
 */
export const getGoalFiles = async (goalId: number): Promise<GoalFile[]> => {
  const response = await api.get<GoalFile[]>(`/api/goals/${goalId}/files`);
  return response.data;
};

/**
 * Upload a file to a goal
 */
export const uploadGoalFile = async (
  goalId: number,
  file: File
): Promise<GoalFileUploadResponse> => {
  // Validate file size
  if (file.size > FILE_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds ${FILE_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE_MB}MB limit`
    );
  }

  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<GoalFileUploadResponse>(
    `/api/goals/${goalId}/files`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Upload multiple files to a goal
 */
export const uploadGoalFiles = async (
  goalId: number,
  files: File[]
): Promise<GoalFileUploadResponse[]> => {
  const uploadPromises = files.map((file) => uploadGoalFile(goalId, file));
  return Promise.all(uploadPromises);
};

/**
 * Get download URL for a file
 */
export const getFileDownloadUrl = async (
  goalId: number,
  fileId: number
): Promise<FileDownloadResponse> => {
  const response = await api.get<FileDownloadResponse>(
    `/api/goals/${goalId}/files/${fileId}/download`
  );
  return response.data;
};

/**
 * Download a file (triggers browser download)
 */
export const downloadFile = async (goalId: number, fileId: number, fileName: string): Promise<void> => {
  const downloadResponse = await getFileDownloadUrl(goalId, fileId);

  if (downloadResponse.download_url) {
    // Create temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = downloadResponse.download_url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    throw new Error('Failed to generate download URL');
  }
};

/**
 * Delete a file from a goal
 */
export const deleteGoalFile = async (goalId: number, fileId: number): Promise<void> => {
  await api.delete(`/api/goals/${goalId}/files/${fileId}`);
};

/**
 * Validate file before upload
 */
export const validateFileForUpload = (file: File): { valid: boolean; error?: string } => {
  if (file.size > FILE_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${FILE_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE_MB}MB limit`,
    };
  }

  return { valid: true };
};

/**
 * Validate multiple files before upload
 */
export const validateFilesForUpload = (
  files: File[],
  existingFileCount: number = 0
): { valid: boolean; error?: string } => {
  const totalFiles = existingFileCount + files.length;

  if (totalFiles > FILE_UPLOAD_CONSTRAINTS.MAX_FILES_PER_GOAL) {
    return {
      valid: false,
      error: `Maximum ${FILE_UPLOAD_CONSTRAINTS.MAX_FILES_PER_GOAL} files per goal. You can add ${
        FILE_UPLOAD_CONSTRAINTS.MAX_FILES_PER_GOAL - existingFileCount
      } more file(s).`,
    };
  }

  for (const file of files) {
    const validation = validateFileForUpload(file);
    if (!validation.valid) {
      return validation;
    }
  }

  return { valid: true };
};

/**
 * Goal File Attachment Types
 */

export interface GoalFile {
  id: number;
  goal_id: number;
  file_name: string;
  file_path: string;
  file_size: number; // Size in bytes
  mime_type: string | null;
  uploaded_by: string; // User UUID
  uploaded_at: string; // ISO datetime string
}

export interface GoalFileUploadResponse {
  file: GoalFile;
  download_url: string | null;
}

export interface FileDownloadResponse {
  file_id: number;
  file_name: string;
  download_url: string | null;
  expires_in: number; // Seconds
}

/**
 * Helper to format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Helper to get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
}

/**
 * Constants for file upload constraints
 */
export const FILE_UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  MAX_FILES_PER_GOAL: 10,
  MAX_FILE_SIZE_MB: 10,
} as const;

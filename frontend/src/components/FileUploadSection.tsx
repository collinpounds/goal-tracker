/**
 * FileUploadSection Component
 * Handles file uploads with drag-and-drop support for goals
 */
import React, { useState, useRef } from 'react';
import { GoalFile, formatFileSize, getFileExtension } from '../types/file.types';
import { uploadGoalFile, deleteGoalFile, downloadFile, validateFilesForUpload } from '../api/files';

interface FileUploadSectionProps {
  goalId: number;
  files: GoalFile[];
  onFilesChange: () => void; // Callback to refresh file list
  readonly?: boolean; // Disable uploads if user doesn't have permission
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  goalId,
  files,
  onFilesChange,
  readonly = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readonly) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (readonly) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = async (filesToUpload: File[]) => {
    setError(null);

    // Validate files
    const validation = validateFilesForUpload(filesToUpload, files.length);
    if (!validation.valid) {
      setError(validation.error || 'Invalid files');
      return;
    }

    // Upload files one by one
    for (const file of filesToUpload) {
      const fileKey = `${file.name}-${Date.now()}`;
      setUploadingFiles((prev) => [...prev, fileKey]);
      setUploadProgress((prev) => ({ ...prev, [fileKey]: 0 }));

      try {
        await uploadGoalFile(goalId, file);
        setUploadProgress((prev) => ({ ...prev, [fileKey]: 100 }));

        // Remove from uploading list after short delay
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((key) => key !== fileKey));
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[fileKey];
            return newProgress;
          });
        }, 1000);

        // Refresh file list
        onFilesChange();
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Failed to upload file');
        setUploadingFiles((prev) => prev.filter((key) => key !== fileKey));
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileId: number) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteGoalFile(goalId, fileId);
        onFilesChange();
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Failed to delete file');
      }
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      await downloadFile(goalId, fileId, fileName);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to download file');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!readonly && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div>
              <span className="text-blue-600 font-medium">Click to upload</span>
              <span className="text-gray-600"> or drag and drop</span>
            </div>
            <p className="text-sm text-gray-500">
              Maximum 10MB per file • {10 - files.length} file(s) remaining
            </p>
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-medium">Upload Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Uploading Files Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((fileKey) => (
            <div key={fileKey} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Uploading {fileKey.split('-')[0]}...
                </span>
                <span className="text-sm text-blue-700">{uploadProgress[fileKey]}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress[fileKey]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">
            Attached Files ({files.length}/10)
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* File Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">
                      {getFileExtension(file.file_name)}
                    </span>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file_size)} •{' '}
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                  <button
                    onClick={() => handleDownload(file.id, file.file_name)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Download"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                  {!readonly && (
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No files attached</p>
      )}
    </div>
  );
};

export default FileUploadSection;

/**
 * GoalDetailPanel Component
 * Side panel that slides in from the right to display goal details, files, and teams
 */
import React, { useState, useEffect } from 'react';
import { Goal } from '../types/goal.types';
import { getGoalFiles } from '../api/files';
import { GoalFile } from '../types/file.types';
import FileUploadSection from './FileUploadSection';
import TeamTag from './TeamTag';

interface GoalDetailPanelProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (goal: Goal) => void;
}

const GoalDetailPanel: React.FC<GoalDetailPanelProps> = ({
  goal,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [files, setFiles] = useState<GoalFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'files' | 'teams'>('details');

  useEffect(() => {
    if (goal && isOpen) {
      loadFiles();
    }
  }, [goal, isOpen]);

  const loadFiles = async () => {
    if (!goal) return;

    setLoading(true);
    try {
      const fetchedFiles = await getGoalFiles(goal.id);
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesChange = () => {
    loadFiles();
    // Optionally trigger goal refresh in parent
    if (onUpdate && goal) {
      // This would need to fetch the updated goal from the API
      // For now, just reload files
    }
  };

  if (!goal) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div
        className={`fixed right-0 top-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full md:w-2/3 lg:w-1/2 xl:w-2/5 max-w-2xl overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900 flex-1 pr-4">Goal Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-3 px-4 font-medium text-sm transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'files'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Files</span>
            {files.length > 0 && (
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                {files.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`py-3 px-4 font-medium text-sm transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'teams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Teams</span>
            {goal.teams && goal.teams.length > 0 && (
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                {goal.teams.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <h3 className="text-xl font-bold text-gray-900">{goal.title}</h3>
              </div>

              {/* Description */}
              {goal.description && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <p className="text-gray-700 whitespace-pre-wrap">{goal.description}</p>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    goal.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : goal.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {goal.status.replace('_', ' ').charAt(0).toUpperCase() +
                    goal.status.replace('_', ' ').slice(1)}
                </span>
              </div>

              {/* Target Date */}
              {goal.target_date && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Date
                  </label>
                  <p className="text-gray-700">
                    {new Date(goal.target_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {/* Created Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Created</label>
                <p className="text-gray-700">
                  {new Date(goal.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Categories */}
              {Array.isArray(goal.categories) && goal.categories.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {goal.categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${category.color}20`,
                          color: category.color,
                        }}
                      >
                        {category.icon && <span className="mr-1">{category.icon}</span>}
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Public/Private Badge */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Visibility</label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    goal.is_public
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {goal.is_public ? '🌐 Public' : '🔒 Private'}
                </span>
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <FileUploadSection
                  goalId={goal.id}
                  files={files}
                  onFilesChange={handleFilesChange}
                  readonly={false} // TODO: Check permissions based on goal ownership / team membership
                />
              )}
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div>
              {Array.isArray(goal.teams) && goal.teams.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    This goal is shared with the following teams:
                  </p>
                  {goal.teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <TeamTag team={team} />
                      {/* Could add more team details or actions here */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-gray-500 font-medium">No teams assigned</p>
                  <p className="text-sm text-gray-400 mt-1">
                    This is a personal goal not shared with any teams
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                // TODO: Implement edit functionality
                alert('Edit functionality coming soon!');
              }}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Edit Goal
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GoalDetailPanel;

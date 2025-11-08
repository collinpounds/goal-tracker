import React from 'react';
import TeamTag from './TeamTag';
import CategoryTag from './CategoryTag';
import type { Goal, GoalStatus, Team, Category } from '../types';

type StatusColor = Record<GoalStatus, string>;
type StatusLabel = Record<GoalStatus, string>;

const statusColors: StatusColor = {
  pending: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300',
  in_progress: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300',
  completed: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300',
};

const statusLabels: StatusLabel = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: number) => void;
  onStatusChange?: (goalId: number, status: string) => void;
  onCardClick?: (goal: Goal) => void;
  teams?: Team[];
  categories?: Category[];
}

export default function GoalCard({ goal, onEdit, onDelete, onStatusChange, onCardClick, teams = [], categories = [] }: GoalCardProps) {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No target date';
    return new Date(dateString).toLocaleDateString();
  };

  const fileCount = goal.files?.length || 0;

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 relative cursor-pointer"
      onClick={() => onCardClick?.(goal)}
    >
      {/* Delete Button - Top Right */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            onDelete(goal.id);
          }}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete goal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="mb-3 pr-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800 flex-1 pr-4">{goal.title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm whitespace-nowrap ${statusColors[goal.status]}`}>
            {statusLabels[goal.status]}
          </span>
        </div>

        {/* Badges Row - Team badges, Public badge, and File count badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {goal.is_public && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-200">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Public
            </span>
          )}

          {/* File Count Badge */}
          {fileCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium border border-purple-200">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {fileCount} {fileCount === 1 ? 'file' : 'files'}
            </span>
          )}

          {/* Team Badges */}
          {Array.isArray(teams) && teams.length > 0 && teams.map((team) => (
            <TeamTag key={team.id} team={team} size="md" />
          ))}
        </div>
      </div>

      {goal.description && (
        <p className="text-gray-600 mb-4">{goal.description}</p>
      )}

      <div className="flex gap-4 text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">{formatDate(goal.target_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatDate(goal.created_at)}</span>
        </div>
      </div>

      {onStatusChange || onEdit ? (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2">
            {onStatusChange && (
              <select
                value={goal.status}
                onChange={(e) => {
                  e.stopPropagation();
                  onStatusChange(goal.id, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:border-gray-400 transition-colors"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            )}

            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(goal);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
          </div>

          {/* Goal Complete Button - Only show if not already completed */}
          {onStatusChange && goal.status !== 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(goal.id, 'completed');
              }}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-xl transform hover:scale-105 font-bold text-lg flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Goal Complete
            </button>
          )}

          {/* Category Pills Section - Below Complete Button */}
          {Array.isArray(categories) && categories.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">Categories:</span>
                {categories.map((category) => (
                  <CategoryTag key={category.id} category={category} size="sm" />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

import React from 'react';

const statusColors = {
  pending: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300',
  in_progress: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300',
  completed: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300',
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function GoalCard({ goal, onEdit, onDelete, onStatusChange }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'No target date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1">
          <h3 className="text-xl font-semibold text-gray-800">{goal.title}</h3>
          {goal.is_public && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-200">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Public
            </span>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm ${statusColors[goal.status]}`}>
          {statusLabels[goal.status]}
        </span>
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

      {onStatusChange || onEdit || onDelete ? (
        <div className="flex gap-2">
          {onStatusChange && (
            <select
              value={goal.status}
              onChange={(e) => onStatusChange(goal.id, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:border-gray-400 transition-colors"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

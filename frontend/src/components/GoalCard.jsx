import React from 'react';

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-800">{goal.title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[goal.status]}`}>
          {statusLabels[goal.status]}
        </span>
      </div>

      {goal.description && (
        <p className="text-gray-600 mb-4">{goal.description}</p>
      )}

      <div className="text-sm text-gray-500 mb-4">
        <div>Target: {formatDate(goal.target_date)}</div>
        <div>Created: {formatDate(goal.created_at)}</div>
      </div>

      <div className="flex gap-2">
        <select
          value={goal.status}
          onChange={(e) => onStatusChange(goal.id, e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <button
          onClick={() => onEdit(goal)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(goal.id)}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

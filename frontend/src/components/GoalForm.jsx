import React, { useState, useEffect } from 'react';

export default function GoalForm({ goal, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    target_date: '',
    is_public: false,
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        status: goal.status || 'pending',
        target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
        is_public: goal.is_public || false,
      });
    }
  }, [goal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      target_date: formData.target_date ? new Date(formData.target_date).toISOString() : null,
    };
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {goal ? 'Edit Goal' : 'Create New Goal'}
      </h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter goal title"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter goal description"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Target Date
        </label>
        <input
          type="date"
          name="target_date"
          value={formData.target_date}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer">
          <input
            type="checkbox"
            name="is_public"
            checked={formData.is_public}
            onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span>Make this goal public (visible to other users)</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium"
        >
          {goal ? 'Update Goal' : 'Create Goal'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

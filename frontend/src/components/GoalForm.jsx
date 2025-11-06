import React, { useState, useEffect } from 'react';

export default function GoalForm({ goal, onSubmit, onCancel, teams = [], categories = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    target_date: '',
    is_public: false,
    team_ids: [],
    category_ids: [],
  });

  useEffect(() => {
    if (goal) {
      // Extract team IDs from teams array
      const teamIds = goal.teams ? goal.teams.map(team => team.id) : [];
      // Extract category IDs from categories array
      const categoryIds = goal.categories ? goal.categories.map(category => category.id) : [];

      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        status: goal.status || 'pending',
        target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
        is_public: goal.is_public || false,
        team_ids: teamIds,
        category_ids: categoryIds,
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

  const handleTeamSelection = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const selectedIds = options.map(opt => parseInt(opt.value));
    setFormData({ ...formData, team_ids: selectedIds });
  };

  const handleCategorySelection = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const selectedIds = options.map(opt => parseInt(opt.value));
    setFormData({ ...formData, category_ids: selectedIds });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800">
        {goal ? 'Edit Goal' : 'Create New Goal'}
      </h2>

      <div className="mb-3">
        <label className="block text-gray-700 font-medium mb-1 text-sm">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Enter goal title"
        />
      </div>

      <div className="mb-3">
        <label className="block text-gray-700 font-medium mb-1 text-sm">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Enter goal description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">
            Target Date
          </label>
          <input
            type="date"
            name="target_date"
            value={formData.target_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">
            Teams
          </label>
          <select
            multiple
            value={formData.team_ids}
            onChange={handleTeamSelection}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            size="3"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">
            Categories
          </label>
          <select
            multiple
            value={formData.category_ids}
            onChange={handleCategorySelection}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            size="3"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon && `${category.icon} `}{category.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer">
          <input
            type="checkbox"
            name="is_public"
            checked={formData.is_public}
            onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm">Make this goal public</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm"
        >
          {goal ? 'Update Goal' : 'Create Goal'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

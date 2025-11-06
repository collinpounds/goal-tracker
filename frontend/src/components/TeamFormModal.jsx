import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTeam, updateTeam, setShowTeamForm } from '../models/teamSlice';

const TEAM_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Cyan', value: '#06B6D4' },
];

const TeamFormModal = () => {
  const dispatch = useDispatch();
  const { showTeamForm, editingTeam, teams, loading, error } = useSelector((state) => state.teams);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color_theme: '#3B82F6',
    parent_team_id: null,
  });

  useEffect(() => {
    if (editingTeam) {
      setFormData({
        name: editingTeam.name || '',
        description: editingTeam.description || '',
        color_theme: editingTeam.color_theme || '#3B82F6',
        parent_team_id: editingTeam.parent_team_id || null,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color_theme: '#3B82F6',
        parent_team_id: null,
      });
    }
  }, [editingTeam, showTeamForm]);

  const handleClose = () => {
    dispatch(setShowTeamForm(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingTeam) {
      await dispatch(updateTeam({ teamId: editingTeam.id, teamData: formData }));
    } else {
      await dispatch(createTeam(formData));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? null : value,
    }));
  };

  // Filter available parent teams (exclude self and descendants if editing)
  const availableParentTeams = teams.filter((team) => {
    if (!editingTeam) return team.nesting_level < 2; // Can only nest up to level 2
    return team.id !== editingTeam.id && team.nesting_level < 2;
  });

  if (!showTeamForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingTeam ? 'Edit Team' : 'Create New Team'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Team Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Engineering Team"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Brief description of the team..."
            />
          </div>

          {/* Color Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Color</label>
            <div className="grid grid-cols-5 gap-2">
              {TEAM_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color_theme: color.value }))}
                  className={`w-full aspect-square rounded-lg transition-all ${
                    formData.color_theme === color.value
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Parent Team (for nested teams) */}
          {!editingTeam && availableParentTeams.length > 0 && (
            <div>
              <label htmlFor="parent_team_id" className="block text-sm font-medium text-gray-700 mb-1">
                Parent Team (Optional)
              </label>
              <select
                id="parent_team_id"
                name="parent_team_id"
                value={formData.parent_team_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None (Top-level team)</option>
                {availableParentTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Create a sub-team under an existing team (max 3 levels)
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : editingTeam ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamFormModal;

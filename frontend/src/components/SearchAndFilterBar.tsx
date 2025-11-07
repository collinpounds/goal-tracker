import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '../models/goalSlice';
import type { RootState, AppDispatch, GoalStatus, Category } from '../types';

function SearchAndFilterBar() {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.goals.filters);
  const categories = useSelector((state: RootState) => state.categories.categories);

  const [localSearch, setLocalSearch] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        dispatch(setFilters({ search: localSearch }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, dispatch, filters.search]);

  const handleStatusToggle = (status: GoalStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];

    dispatch(setFilters({ status: newStatus }));
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategories = filters.category_ids.includes(categoryId)
      ? filters.category_ids.filter((id) => id !== categoryId)
      : [...filters.category_ids, categoryId];

    dispatch(setFilters({ category_ids: newCategories }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let sort_by: 'created_at' | 'target_date' | 'title';
    let sort_order: 'asc' | 'desc';

    switch (value) {
      case 'target_date_asc':
        sort_by = 'target_date';
        sort_order = 'asc';
        break;
      case 'target_date_desc':
        sort_by = 'target_date';
        sort_order = 'desc';
        break;
      case 'created_at_desc':
        sort_by = 'created_at';
        sort_order = 'desc';
        break;
      case 'created_at_asc':
        sort_by = 'created_at';
        sort_order = 'asc';
        break;
      case 'title_asc':
        sort_by = 'title';
        sort_order = 'asc';
        break;
      case 'title_desc':
        sort_by = 'title';
        sort_order = 'desc';
        break;
      default:
        sort_by = 'target_date';
        sort_order = 'asc';
    }

    dispatch(setFilters({ sort_by, sort_order }));
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    dispatch(clearFilters());
  };

  const getCurrentSortValue = (): string => {
    if (filters.sort_by === 'target_date' && filters.sort_order === 'asc') return 'target_date_asc';
    if (filters.sort_by === 'target_date' && filters.sort_order === 'desc') return 'target_date_desc';
    if (filters.sort_by === 'created_at' && filters.sort_order === 'desc') return 'created_at_desc';
    if (filters.sort_by === 'created_at' && filters.sort_order === 'asc') return 'created_at_asc';
    if (filters.sort_by === 'title' && filters.sort_order === 'asc') return 'title_asc';
    if (filters.sort_by === 'title' && filters.sort_order === 'desc') return 'title_desc';
    return 'target_date_asc';
  };

  const hasActiveFilters =
    filters.search ||
    filters.status.length > 0 ||
    filters.category_ids.length > 0;

  const statusOptions: GoalStatus[] = ['pending', 'in_progress', 'completed'];

  return (
    <div className="mb-6 space-y-4">
      {/* Search and Sort Row */}
      <div className="flex gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search goals..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Sort Dropdown */}
        <select
          value={getCurrentSortValue()}
          onChange={handleSortChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="target_date_asc">Target Date (Soonest)</option>
          <option value="target_date_desc">Target Date (Latest)</option>
          <option value="created_at_desc">Newest First</option>
          <option value="created_at_asc">Oldest First</option>
          <option value="title_asc">Title (A-Z)</option>
          <option value="title_desc">Title (Z-A)</option>
        </select>

        {/* Filters Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            hasActiveFilters
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {filters.status.length + filters.category_ids.length + (filters.search ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          {/* Status Filters */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.status.includes(status)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category: Category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      filters.category_ids.includes(category.id)
                        ? 'text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                    style={
                      filters.category_ids.includes(category.id)
                        ? { backgroundColor: category.color || undefined }
                        : {}
                    }
                  >
                    {category.icon && <span>{category.icon}</span>}
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-gray-300">
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchAndFilterBar;

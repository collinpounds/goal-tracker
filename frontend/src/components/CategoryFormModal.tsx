import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory, updateCategory, setShowCategoryForm, setEditingCategory } from '../models/categorySlice';
import type { RootState, AppDispatch, CategoryCreate } from '../types';

interface CategoryColor {
  name: string;
  value: string;
}

const CATEGORY_COLORS: CategoryColor[] = [
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

const CategoryFormModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showCategoryForm, editingCategory, loading, error } = useSelector((state: RootState) => state.categories);

  const [formData, setFormData] = useState<CategoryCreate>({
    name: '',
    color: '#3B82F6',
    icon: '',
  });

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        color: editingCategory.color || '#3B82F6',
        icon: editingCategory.icon || '',
      });
    } else {
      setFormData({
        name: '',
        color: '#3B82F6',
        icon: '',
      });
    }
  }, [editingCategory, showCategoryForm]);

  const handleClose = () => {
    dispatch(setShowCategoryForm(false));
    dispatch(setEditingCategory(null));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingCategory) {
      await dispatch(updateCategory({ id: editingCategory.id, data: formData }));
    } else {
      await dispatch(createCategory(formData));
    }

    handleClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!showCategoryForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
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

          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Work, Personal, Health"
            />
          </div>

          {/* Icon (Emoji) */}
          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
              Icon (Emoji)
            </label>
            <input
              type="text"
              id="icon"
              name="icon"
              value={formData.icon || ''}
              onChange={handleChange}
              maxLength={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 💼 🏠 💪"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional emoji to represent this category
            </p>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Color</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                  className={`w-full aspect-square rounded-lg transition-all ${
                    formData.color === color.value
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

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
              {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;

import React from 'react';
import type { Category } from '../types';

type TagSize = 'sm' | 'md' | 'lg';

interface CategoryTagProps {
  category: Category;
  size?: TagSize;
  showIcon?: boolean;
}

export default function CategoryTag({ category, size = 'md', showIcon = true }: CategoryTagProps) {
  const sizeClasses: Record<TagSize, string> = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium text-white ${sizeClasses[size]}`}
      style={{
        backgroundColor: category.color || '#6b7280',
      }}
    >
      {showIcon && category.icon && <span>{category.icon}</span>}
      {category.name}
    </span>
  );
}

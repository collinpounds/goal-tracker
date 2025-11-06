import React from 'react';

export default function CategoryTag({ category, size = 'md', showIcon = true }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium text-white ${sizeClasses[size]}`}
      style={{
        backgroundColor: category.color,
      }}
    >
      {showIcon && category.icon && <span>{category.icon}</span>}
      {category.name}
    </span>
  );
}

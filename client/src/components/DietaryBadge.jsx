import React from 'react';

/**
 * Professional Restaurant Dietary Indicator
 * Clean minimalist typography badge with subtle crisp border.
 * Strictly NO emojis and NO circular color dots.
 */
export function DietaryBadge({ isVeg, showText = true, size }) {
  const isVegetarian = Boolean(isVeg);
  const color = isVegetarian ? '#2E7D32' : '#C62828';
  const bg = isVegetarian ? '#F1F8F3' : '#FDF2F2';
  const label = isVegetarian ? 'VEG' : 'NON-VEG';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 6px',
        borderRadius: '4px',
        border: `1.5px solid ${color}`,
        backgroundColor: bg,
        color: color,
        fontSize: '0.66rem',
        fontWeight: 700,
        letterSpacing: '0.5px',
        lineHeight: 1.2,
        userSelect: 'none',
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </span>
  );
}

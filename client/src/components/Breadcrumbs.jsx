import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs({ items = [], style = {}, theme = 'dark' }) {
  if (!items || items.length === 0) return null;

  const isDarkTheme = theme === 'dark';
  const linkColor = isDarkTheme ? '#D4E2C7' : '#5E6C51';
  const activeColor = isDarkTheme ? '#FFFFFF' : '#1F241C';
  const chevronColor = isDarkTheme ? '#A7B799' : '#85926B';

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '10px 0 16px',
        fontSize: '0.96rem',
        ...style
      }}
    >
      <button
        onClick={items[0]?.onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: items.length === 1 ? activeColor : linkColor,
          fontWeight: 700,
          background: 'none',
          border: 'none',
          cursor: items[0]?.onClick ? 'pointer' : 'default',
          padding: 0,
          fontSize: '0.96rem',
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (items[0]?.onClick) e.currentTarget.style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          if (items[0]?.onClick) e.currentTarget.style.opacity = '1';
        }}
      >
        <Home size={16} color={linkColor} />
        <span>Home</span>
      </button>

      {items.slice(1).map((item, idx) => {
        const isLast = idx === items.length - 2;
        return (
          <React.Fragment key={idx}>
            <ChevronRight size={16} color={chevronColor} />
            {isLast || !item.onClick ? (
              <span
                style={{
                  color: activeColor,
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  maxWidth: '300px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textShadow: isDarkTheme ? '0 1px 3px rgba(0,0,0,0.5)' : 'none'
                }}
              >
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                style={{
                  color: linkColor,
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.96rem',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

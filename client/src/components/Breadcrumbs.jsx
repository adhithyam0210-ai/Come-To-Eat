import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs({ items = [], style = {}, theme = 'light' }) {
  if (!items || items.length === 0) return null;

  const isDark = theme === 'dark';

  // High-contrast, dark and bold color tokens
  const containerBg = isDark
    ? 'rgba(18, 24, 15, 0.72)'
    : '#EEF3E8';
  const containerBorder = isDark
    ? '1px solid rgba(255, 255, 255, 0.22)'
    : '1px solid #CAD8BD';
  const linkColor = isDark ? '#E8F5E9' : '#232D1B';
  const activeColor = isDark ? '#FFFFFF' : '#11160F';
  const iconColor = isDark ? '#81C784' : '#3E502F';
  const chevronColor = isDark ? '#A5D6A7' : '#4E623B';

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '9999px',
        backgroundColor: containerBg,
        border: containerBorder,
        boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
        backdropFilter: isDark ? 'blur(8px)' : 'none',
        fontSize: '0.88rem',
        margin: '8px 0 16px',
        ...style
      }}
    >
      <button
        onClick={items[0]?.onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          color: items.length === 1 ? activeColor : linkColor,
          fontWeight: 800,
          background: 'none',
          border: 'none',
          cursor: items[0]?.onClick ? 'pointer' : 'default',
          padding: '2px 4px',
          borderRadius: '6px',
          fontSize: '0.88rem',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          if (items[0]?.onClick) {
            e.currentTarget.style.color = isDark ? '#FFFFFF' : '#85926B';
            e.currentTarget.style.textDecoration = 'underline';
          }
        }}
        onMouseLeave={(e) => {
          if (items[0]?.onClick) {
            e.currentTarget.style.color = items.length === 1 ? activeColor : linkColor;
            e.currentTarget.style.textDecoration = 'none';
          }
        }}
      >
        <Home size={15} color={iconColor} strokeWidth={2.2} />
        <span>Home</span>
      </button>

      {items.slice(1).map((item, idx) => {
        const isLast = idx === items.length - 2;
        return (
          <React.Fragment key={idx}>
            <ChevronRight size={15} color={chevronColor} strokeWidth={2.4} />
            {isLast || !item.onClick ? (
              <span
                style={{
                  color: activeColor,
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  maxWidth: '260px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  padding: '2px 4px',
                  letterSpacing: '-0.2px'
                }}
              >
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                style={{
                  color: linkColor,
                  fontWeight: 800,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = isDark ? '#FFFFFF' : '#85926B';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = linkColor;
                  e.currentTarget.style.textDecoration = 'none';
                }}
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

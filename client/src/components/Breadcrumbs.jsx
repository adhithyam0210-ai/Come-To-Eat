import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs({ items = [], style = {} }) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        padding: '10px 0 16px',
        fontSize: '0.82rem',
        color: '#6F7B62',
        ...style
      }}
    >
      <button
        onClick={items[0]?.onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          color: items.length === 1 ? '#2A3324' : '#85926B',
          fontWeight: 600,
          background: 'none',
          border: 'none',
          cursor: items[0]?.onClick ? 'pointer' : 'default',
          padding: 0,
          fontSize: '0.82rem',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (items[0]?.onClick) e.currentTarget.style.color = '#2A3324';
        }}
        onMouseLeave={(e) => {
          if (items[0]?.onClick) e.currentTarget.style.color = '#85926B';
        }}
      >
        <Home size={13} />
        <span>Home</span>
      </button>

      {items.slice(1).map((item, idx) => {
        const isLast = idx === items.length - 2;
        return (
          <React.Fragment key={idx}>
            <ChevronRight size={13} color="#A7B399" />
            {isLast || !item.onClick ? (
              <span
                style={{
                  color: '#2A3324',
                  fontWeight: 700,
                  maxWidth: '260px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                style={{
                  color: '#85926B',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.82rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#2A3324')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#85926B')}
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

import React, { useState, useEffect } from 'react';

export function SplashScreen({ onFinish }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show splash for 1.3s, then start fade out transition
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1300);

    // Completely unmount after fade-out transition completes (600ms)
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 1900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      id="splash-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#1E2519',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '24px',
        overflow: 'hidden'
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(133, 146, 107, 0.35) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'splashPulse 2.5s ease-in-out infinite alternate',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Official Brand Logo (Enlarged) */}
        <div
          style={{
            position: 'relative',
            width: 'clamp(140px, 18vw, 175px)',
            height: 'clamp(140px, 18vw, 175px)',
            borderRadius: '50%',
            padding: '5px',
            background: 'linear-gradient(135deg, #A2B185 0%, #63704C 100%)',
            boxShadow: '0 16px 44px rgba(0, 0, 0, 0.5)',
            marginBottom: '24px',
            animation: 'splashScale 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <img
            src="/logo.jpg"
            alt="Come To Eat Logo"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              backgroundColor: '#FFFFFF'
            }}
          />
        </div>

        {/* Brand Name (Enlarged) */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.7rem, 7vw, 3.8rem)',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.5px',
            margin: '0 0 8px 0',
            lineHeight: 1.15,
            textShadow: '0 3px 16px rgba(0,0,0,0.35)',
            animation: 'splashFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          Come To Eat
        </h1>

        {/* Subtitle (Enlarged) */}
        <div
          style={{
            fontSize: 'clamp(1.05rem, 2.8vw, 1.4rem)',
            textTransform: 'uppercase',
            letterSpacing: '5px',
            color: '#A2B185',
            fontWeight: 800,
            marginBottom: '32px',
            animation: 'splashFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          Café
        </div>

        {/* Minimal loading bar */}
        <div
          style={{
            width: '160px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#E76F51',
              borderRadius: '4px',
              animation: 'splashProgress 1.2s ease-in-out forwards'
            }}
          />
        </div>
      </div>
    </div>
  );
}

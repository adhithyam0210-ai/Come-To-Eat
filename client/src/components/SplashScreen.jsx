import React, { useState, useEffect } from 'react';
import { Sparkles, Utensils } from 'lucide-react';

const FEATURED_FOOD_TEASERS = [
  {
    name: 'Gourmet Burgers',
    tag: 'Smash Patties',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Tiger Milk Boba',
    tag: 'Handcrafted Coolers',
    img: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Crispy Gold Fries',
    tag: 'Fresh Seasoned',
    img: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Steamed Momos',
    tag: 'Darjeeling Special',
    img: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=400&q=80'
  }
];

export function SplashScreen({ isLoading = false, onFinish }) {
  const [fading, setFading] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [statusTextIndex, setStatusTextIndex] = useState(0);

  const statusMessages = [
    'Loading Fresh Café Items...',
    'Synchronizing Live Menu & Offers...',
    'Preparing Gourmet Dishes...',
    'Welcome to Come To Eat!'
  ];

  // Rotate status message for engaging loading feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusTextIndex((prev) => (prev + 1) % (statusMessages.length - 1));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Ensure minimum splash duration of 1.6 seconds for smooth branding experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  // When both min timer has elapsed and API loading is complete, trigger fade out
  useEffect(() => {
    if (minTimePassed && !isLoading && !fading) {
      setStatusTextIndex(statusMessages.length - 1);
      const fadeTimer = setTimeout(() => {
        setFading(true);
      }, 200);

      const finishTimer = setTimeout(() => {
        if (onFinish) onFinish();
      }, 700);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [minTimePassed, isLoading, fading, onFinish]);

  return (
    <div
      id="splash-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'radial-gradient(circle at 50% 40%, #7D0009 0%, #450005 60%, #1A0002 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '24px',
        overflow: 'hidden'
      }}
    >
      {/* Ambient Radial Background Effects */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 184, 0, 0.25) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />

      {/* Floating Background Food Showcase Cards */}
      <div
        className="splash-food-floating-container"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 40px'
        }}
      >
        {/* Left Side Food Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="desktop-only">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 184, 0, 0.4)',
              padding: '10px 18px 10px 10px',
              borderRadius: '20px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
              animation: 'floatSlow 4s ease-in-out infinite'
            }}
          >
            <img
              src={FEATURED_FOOD_TEASERS[0].img}
              alt={FEATURED_FOOD_TEASERS[0].name}
              style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>{FEATURED_FOOD_TEASERS[0].name}</div>
              <div style={{ fontSize: '0.72rem', color: '#FFB800', fontWeight: 700 }}>{FEATURED_FOOD_TEASERS[0].tag}</div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              padding: '10px 18px 10px 10px',
              borderRadius: '20px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
              marginLeft: '30px',
              animation: 'floatSlowAlt 4.5s ease-in-out infinite'
            }}
          >
            <img
              src={FEATURED_FOOD_TEASERS[1].img}
              alt={FEATURED_FOOD_TEASERS[1].name}
              style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>{FEATURED_FOOD_TEASERS[1].name}</div>
              <div style={{ fontSize: '0.72rem', color: '#FFB800', fontWeight: 700 }}>{FEATURED_FOOD_TEASERS[1].tag}</div>
            </div>
          </div>
        </div>

        {/* Right Side Food Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="desktop-only">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              padding: '10px 18px 10px 10px',
              borderRadius: '20px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
              marginRight: '30px',
              animation: 'floatSlowAlt 3.8s ease-in-out infinite'
            }}
          >
            <img
              src={FEATURED_FOOD_TEASERS[2].img}
              alt={FEATURED_FOOD_TEASERS[2].name}
              style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>{FEATURED_FOOD_TEASERS[2].name}</div>
              <div style={{ fontSize: '0.72rem', color: '#FFB800', fontWeight: 700 }}>{FEATURED_FOOD_TEASERS[2].tag}</div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 184, 0, 0.4)',
              padding: '10px 18px 10px 10px',
              borderRadius: '20px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
              animation: 'floatSlow 4.2s ease-in-out infinite'
            }}
          >
            <img
              src={FEATURED_FOOD_TEASERS[3].img}
              alt={FEATURED_FOOD_TEASERS[3].name}
              style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>{FEATURED_FOOD_TEASERS[3].name}</div>
              <div style={{ fontSize: '0.72rem', color: '#FFB800', fontWeight: 700 }}>{FEATURED_FOOD_TEASERS[3].tag}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Center Brand Content */}
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
        {/* Official Shop Logo with Pulsing Gold Badge */}
        <div
          style={{
            position: 'relative',
            width: 'clamp(140px, 20vw, 180px)',
            height: 'clamp(140px, 20vw, 180px)',
            borderRadius: '50%',
            padding: '6px',
            background: 'linear-gradient(135deg, #FFB800 0%, #FF8C00 50%, #8D0A13 100%)',
            boxShadow: '0 18px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(255, 184, 0, 0.4)',
            marginBottom: '22px',
            animation: 'splashLogoPulse 2.5s ease-in-out infinite alternate'
          }}
        >
          <img
            src="/logo.jpg"
            alt="Come To Eat Shop Logo"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              backgroundColor: '#FFFFFF',
              border: '2px solid #FFFFFF'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              backgroundColor: '#FFB800',
              color: '#8D0A13',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              border: '2px solid #8D0A13'
            }}
          >
            <Sparkles size={20} />
          </div>
        </div>

        {/* Shop Name */}
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 'clamp(2.6rem, 6.5vw, 3.8rem)',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.5px',
            margin: '0 0 6px 0',
            lineHeight: 1.1,
            textShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}
        >
          Come To Eat
        </h1>

        {/* Shop Subtitle Tagline */}
        <div
          style={{
            fontSize: 'clamp(0.95rem, 2.5vw, 1.25rem)',
            textTransform: 'uppercase',
            letterSpacing: '5px',
            color: '#FFB800',
            fontWeight: 800,
            marginBottom: '28px',
            textShadow: '0 2px 10px rgba(255,184,0,0.3)'
          }}
        >
          DYNAMIC CAFÉ
        </div>

        {/* Mobile Food Images Showcase Strip */}
        <div
          className="mobile-only"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
            overflowX: 'auto',
            padding: '4px'
          }}
        >
          {FEATURED_FOOD_TEASERS.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 184, 0, 0.4)',
                padding: '6px 12px 6px 6px',
                borderRadius: '16px',
                whiteSpace: 'nowrap'
              }}
            >
              <img
                src={item.img}
                alt={item.name}
                style={{ width: '32px', height: '32px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 700 }}>{item.name}</span>
            </div>
          ))}
        </div>

        {/* Dynamic Loading Status Text */}
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.88)',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '24px'
          }}
        >
          <Utensils size={15} color="#FFB800" />
          <span>{statusMessages[statusTextIndex]}</span>
        </div>

        {/* Animated Loading Bar */}
        <div
          style={{
            width: '220px',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '9999px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)'
          }}
        >
          <div
            style={{
              width: minTimePassed && !isLoading ? '100%' : '75%',
              height: '100%',
              background: 'linear-gradient(90deg, #FFB800 0%, #FF8C00 50%, #FFB800 100%)',
              borderRadius: '9999px',
              boxShadow: '0 0 12px rgba(255, 184, 0, 0.8)',
              transition: 'width 0.4s ease-out'
            }}
          />
        </div>
      </div>
    </div>
  );
}

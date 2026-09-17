import React, { useState } from 'react';
import { Star, Heart, MessageSquare, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const SAMPLE_REVIEWS = [
  {
    id: 1,
    name: 'Alex Rivera',
    dish: 'Classic Gourmet Smash Burger',
    rating: 5,
    text: 'One of the juiciest smash burgers in town! The crust on the patty was crispy and seasoned to perfection. The bun was soft, buttery, and packaging kept it steaming hot upon arrival.',
    date: '2 days ago',
    verified: true
  },
  {
    id: 2,
    name: 'Meera Kapoor',
    dish: 'Brown Sugar Tiger Milk Boba',
    rating: 5,
    text: 'Warm chewy brown sugar pearls and rich organic milk. Way better than generic franchise bubble tea. You can taste the real slow-simmered caramel!',
    date: '3 days ago',
    verified: true
  },
  {
    id: 3,
    name: 'David Chen',
    dish: 'Steamed Darjeeling Veg Momos',
    rating: 5,
    text: 'Thin delicate skin and packed with fresh herbs. The spicy roasted tomato chutney is fiery and addictive! Easily ordered 3 times this week.',
    date: '1 week ago',
    verified: true
  },
  {
    id: 4,
    name: 'Pooja Hegde',
    dish: 'Classic Margherita Pizza',
    rating: 5,
    text: 'Stone-baked with blistering leopard crust. Sweet San Marzano sauce and gooey fresh mozzarella. Authentic Italian taste in every bite.',
    date: '1 week ago',
    verified: true
  },
  {
    id: 5,
    name: 'Rahul Sharma',
    dish: 'Creamy Alfredo Penne Pasta',
    rating: 4,
    text: 'Rich garlic parmesan sauce and perfectly al dente penne. Very generous portions, came with warm toasted garlic bread slices.',
    date: '2 weeks ago',
    verified: true
  },
  {
    id: 6,
    name: 'Ananya Deshmukh',
    dish: 'Crispy Truffle Herb Fries',
    rating: 5,
    text: 'Crispy even after delivery! The truffle oil aroma was mouth-watering and the rosemary salt gave it a great gourmet kick.',
    date: '2 weeks ago',
    verified: true
  }
];

export function ReviewsPage({ onOpenAuth, onOpenOrders }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [newRating, setNewRating] = useState(5);
  const [newDish, setNewDish] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter === 'all') return true;
    return r.rating === Number(ratingFilter);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev = {
      id: Date.now(),
      name: user ? user.name : 'Valued Guest',
      dish: newDish.trim() || 'Café Favorite',
      rating: newRating,
      text: newComment.trim(),
      date: 'Just now',
      verified: !!user
    };

    setReviews([newRev, ...reviews]);
    setNewComment('');
    setNewDish('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '80vh', paddingBottom: '80px' }}>
      {/* Header Banner */}
      <div style={{
        position: 'relative',
        backgroundColor: '#1E251B',
        color: '#FFFFFF',
        padding: 'clamp(40px, 6vw, 70px) 0 clamp(44px, 6vw, 80px)',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #1E251B 0%, #293424 70%, #FAF8F5 100%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '680px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(133, 146, 107, 0.3)',
            border: '1px solid rgba(133, 146, 107, 0.5)',
            padding: '5px 16px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: '#E8EFE1',
            marginBottom: '14px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={14} /> Guest Testimonials & Reviews
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            lineHeight: 1.18,
            color: '#FFFFFF',
            margin: '0 0 14px'
          }}>
            Loved by Foodies
          </h1>

          <p style={{
            color: '#D4DEC8',
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            lineHeight: 1.6,
            margin: '0 0 24px'
          }}>
            Read authentic feedback from our dining guests. Every review helps our chefs maintain the highest standards of taste, freshness, and packaging.
          </p>

          {/* Rating Snapshot Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            padding: '10px 24px',
            borderRadius: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>4.9</span>
              <div style={{ display: 'flex', gap: '2px', color: '#F59E0B' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#F59E0B" />
                ))}
              </div>
            </div>
            <span style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontSize: '0.85rem', color: '#EBF0E4', fontWeight: 600 }}>Over 1,200+ Verified Orders</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '30px' }}>
        {/* Rating Filter Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'all', label: 'All Reviews' },
              { id: '5', label: '5-Star Reviews' },
              { id: '4', label: '4-Star Reviews' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRatingFilter(tab.id)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '20px',
                  border: ratingFilter === tab.id ? '1.5px solid #85926B' : '1px solid #DCE3D4',
                  backgroundColor: ratingFilter === tab.id ? '#85926B' : '#FFFFFF',
                  color: ratingFilter === tab.id ? '#FFFFFF' : '#3D4636',
                  fontWeight: ratingFilter === tab.id ? 700 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.86rem', color: '#6A785E', fontWeight: 600 }}>
            Showing {filteredReviews.length} reviews
          </span>
        </div>

        {/* Reviews Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '50px'
        }}>
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid #ECE7DE',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#97A38C' }}>{rev.date}</span>
                </div>

                <p style={{
                  fontSize: '0.92rem',
                  color: '#3D4636',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  marginBottom: '16px'
                }}>
                  "{rev.text}"
                </p>
              </div>

              <div style={{
                borderTop: '1px solid #F0EFEB',
                paddingTop: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1F241C' }}>{rev.name}</span>
                    {rev.verified && (
                      <span title="Verified Order" style={{ color: '#2E7D32', display: 'flex', alignItems: 'center' }}>
                        <CheckCircle2 size={13} />
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#85926B', fontWeight: 600 }}>
                    Ordered: {rev.dish}
                  </div>
                </div>

                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#EBF0E4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#85926B'
                }}>
                  <Heart size={14} fill="#85926B" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Share Your Feedback Box */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px',
          border: '1px solid #ECE7DE',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
          maxWidth: '720px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#EBF0E4',
              color: '#85926B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <ShieldCheck size={24} color="#85926B" />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1F241C', margin: '0 0 8px' }}>
              Verified Diner Reviews Only
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#6A785E', maxWidth: '560px', margin: '0 auto 22px', lineHeight: 1.6 }}>
              To ensure 100% authentic feedback, reviews can only be submitted by verified diners from their <strong>Order History</strong> after experiencing their meal.
            </p>

            {user ? (
              <button
                onClick={onOpenOrders}
                className="btn-accent"
                style={{ padding: '13px 28px', fontSize: '0.94rem', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Sparkles size={16} /> Rate Your Completed Orders in Order History
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="btn-accent"
                style={{ padding: '13px 28px', fontSize: '0.94rem', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                Sign In to View Orders & Rate Dishes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

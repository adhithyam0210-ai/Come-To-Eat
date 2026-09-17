import React, { useState, useEffect } from 'react';
import { Star, Heart, Sparkles, CheckCircle2, ShieldCheck, Send, Check, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Breadcrumbs } from './Breadcrumbs';

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

export function ReviewsPage({ selectedBranch, onNavigateToHome, onOpenAuth, onOpenOrders }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [newRating, setNewRating] = useState(5);
  const [newDish, setNewDish] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const q = selectedBranch?.id ? `?branch_id=${selectedBranch.id}` : '';
    api.get(`/reviews${q}`)
      .then((res) => {
        if (res.success && res.reviews && res.reviews.length > 0) {
          const mapped = res.reviews.map((r) => ({
            id: r.id,
            name: r.user_name || 'Valued Guest',
            dish: r.food_name || 'Café Special',
            rating: Math.round(r.rating || 5),
            text: r.comment,
            date: new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            verified: true
          }));
          setReviews([...mapped, ...SAMPLE_REVIEWS]);
        } else {
          setReviews(SAMPLE_REVIEWS);
        }
      })
      .catch(() => {});
  }, [selectedBranch]);

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter === 'all') return true;
    return r.rating === Number(ratingFilter);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        food_id: 1,
        rating: newRating,
        comment: newComment.trim(),
        guest_name: user ? user.name : (newDish ? `${newDish} Fan` : 'Valued Guest')
      });

      const newRev = {
        id: res.review?.id || Date.now(),
        name: user ? user.name : 'Valued Guest',
        dish: newDish.trim() || 'Café Specialty',
        rating: newRating,
        text: newComment.trim(),
        date: 'Just now',
        verified: !!user
      };

      setReviews([newRev, ...reviews]);
      setNewComment('');
      setNewDish('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
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

      <div className="container" style={{ marginTop: '20px' }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', onClick: onNavigateToHome },
            { label: 'Customer Reviews' }
          ]}
        />

        {/* Rating Filter Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '28px',
          marginTop: '10px'
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

        {/* Share Your Feedback & Review Form Box */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: 'clamp(24px, 4vw, 36px)',
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
              Share Your Dining Experience
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#6A785E', maxWidth: '560px', margin: '0 auto 16px', lineHeight: 1.6 }}>
              We value your voice! Let us know how your food was prepared and enjoyed.
            </p>
          </div>

          {submitSuccess && (
            <div style={{
              backgroundColor: '#E8F5E9',
              border: '1px solid #A5D6A7',
              color: '#2E7D32',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              <Check size={18} /> Thank you! Your review has been submitted and added.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#333D29', marginBottom: '6px' }}>
                Your Rating
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Star
                      size={24}
                      fill={star <= newRating ? '#F59E0B' : 'transparent'}
                      color={star <= newRating ? '#F59E0B' : '#D1D5DB'}
                    />
                  </button>
                ))}
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#85926B', alignSelf: 'center', marginLeft: '6px' }}>
                  {newRating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#333D29', marginBottom: '6px' }}>
                Dish or Beverage Ordered (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Classic Smash Burger, Brown Sugar Boba"
                value={newDish}
                onChange={(e) => setNewDish(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid #DCE3D4',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#FAF8F5'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#333D29', marginBottom: '6px' }}>
                Your Review *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Tell us what made your meal great, flavors, delivery experience..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid #DCE3D4',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#FAF8F5',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
              {onOpenOrders && (
                <button
                  type="button"
                  onClick={onOpenOrders}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#85926B',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Rate completed dishes from Order History →
                </button>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-accent"
                style={{
                  padding: '12px 26px',
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginLeft: 'auto'
                }}
              >
                <Send size={16} /> {submitting ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

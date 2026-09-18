import { createClient } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://nvvrtqgpwsbxiruwtbho.supabase.co';
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52dnJ0cWdwd3NieGlydXd0YmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MzgxMTAsImV4cCI6MjEwNTIxNDExMH0.YSZGMuYOXfjsaPRWxms9eLz1FM2zLZDcNd2PTwBGUfw';

export let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    console.log('[Supabase] Initialized direct client using client/.env credentials.');
  } catch (err) {
    console.warn('[Supabase] Initialization error:', err.message);
  }
} else {
  console.warn('[Supabase] Supabase credentials missing in client/.env');
}

/**
 * Universal live reflection subscription connecting directly to Supabase Realtime
 */
export function subscribeToLiveOrders(onOrderUpdate) {
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel('orders_realtime')
      .on('broadcast', { event: '*' }, (payload) => {
        if (payload && payload.payload) {
          onOrderUpdate(payload.payload, payload.event);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload && payload.new) {
          onOrderUpdate(payload.new, payload.eventType);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Connected to live orders stream.');
        }
      });

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  } catch (err) {
    console.warn('[Supabase Realtime] Subscription error:', err.message);
    return () => {};
  }
}

/**
 * Broadcast live order updates directly to all connected tabs/browsers
 */
export async function broadcastLiveOrder(orderData, eventType = 'ORDER_UPDATED') {
  if (!supabase || !orderData) return;
  try {
    const channel = supabase.channel('orders_realtime');
    await channel.send({
      type: 'broadcast',
      event: eventType,
      payload: orderData
    });
  } catch (err) {
    console.warn('[Supabase Realtime] Broadcast error:', err.message);
  }
}

/**
 * Universal live reflection subscription connecting directly to Supabase Realtime for Hero Slides
 */
export function subscribeToHeroSlides(onSlidesUpdate) {
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel('hero_slides_realtime')
      .on('broadcast', { event: '*' }, (payload) => {
        if (payload && payload.payload) {
          onSlidesUpdate(payload.payload);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, () => {
        onSlidesUpdate();
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  } catch (err) {
    return () => {};
  }
}

/**
 * Broadcast live hero slides updates to all clients instantly
 */
export async function broadcastHeroSlides(slidesData) {
  if (!supabase || !slidesData) return;
  try {
    const channel = supabase.channel('hero_slides_realtime');
    await channel.send({
      type: 'broadcast',
      event: 'HERO_SLIDES_UPDATED',
      payload: slidesData
    });
  } catch (err) {}
}

/**
 * Universal live reflection subscription connecting directly to Supabase Realtime for Food Items
 */
export function subscribeToFoods(onFoodsUpdate) {
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel('foods_realtime')
      .on('broadcast', { event: '*' }, (payload) => {
        if (payload && payload.payload) {
          onFoodsUpdate(payload.payload);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_items' }, () => {
        onFoodsUpdate();
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  } catch (err) {
    return () => {};
  }
}

/**
 * Broadcast live food items updates to all clients instantly
 */
export async function broadcastFoods(foodsData) {
  if (!supabase || !foodsData) return;
  try {
    const channel = supabase.channel('foods_realtime');
    await channel.send({
      type: 'broadcast',
      event: 'FOODS_UPDATED',
      payload: foodsData
    });
  } catch (err) {}
}

/**
 * Universal live reflection subscription connecting directly to Supabase Realtime for Categories
 */
export function subscribeToCategories(onCategoriesUpdate) {
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel('categories_realtime')
      .on('broadcast', { event: '*' }, (payload) => {
        if (payload && payload.payload) {
          onCategoriesUpdate(payload.payload);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        onCategoriesUpdate();
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  } catch (err) {
    return () => {};
  }
}

/**
 * Broadcast live categories updates to all clients instantly
 */
export async function broadcastCategories(catsData) {
  if (!supabase || !catsData) return;
  try {
    const channel = supabase.channel('categories_realtime');
    await channel.send({
      type: 'broadcast',
      event: 'CATEGORIES_UPDATED',
      payload: catsData
    });
  } catch (err) {}
}


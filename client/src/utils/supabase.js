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
let _ordersChannel = null;
function getOrdersChannel() {
  if (!supabase) return null;
  if (!_ordersChannel) {
    _ordersChannel = supabase.channel('orders_channel');
    _ordersChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase Realtime] Connected to live orders stream.');
      }
    });
  }
  return _ordersChannel;
}

export function subscribeToLiveOrders(onOrderUpdate) {
  if (!supabase) return () => {};

  try {
    const channel = getOrdersChannel();
    channel
      .on('broadcast', { event: '*' }, (payload) => {
        if (payload && payload.payload) {
          onOrderUpdate(payload.payload, payload.event);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload && payload.new) {
          onOrderUpdate(payload.new, payload.eventType);
        }
      });

    return () => {};
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
    const channel = getOrdersChannel();
    if (channel) {
      if (channel.state !== 'joined') {
        await new Promise(r => setTimeout(r, 150));
      }
      await channel.send({
        type: 'broadcast',
        event: eventType,
        payload: orderData
      });
    }
  } catch (err) {
    console.warn('[Supabase Realtime] Broadcast error:', err.message);
  }
}

/**
 * Universal live reflection subscription for Hero Slides
 */
let _heroSlidesChannel = null;
function getHeroSlidesChannel() {
  if (!supabase) return null;
  if (!_heroSlidesChannel) {
    _heroSlidesChannel = supabase.channel('hero_slides_channel');
    _heroSlidesChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase Realtime] Connected to hero_slides_channel');
      }
    });
  }
  return _heroSlidesChannel;
}

export function subscribeToHeroSlides(onSlidesUpdate) {
  if (!supabase) return () => {};

  try {
    const channel = getHeroSlidesChannel();
    channel
      .on('broadcast', { event: 'HERO_SLIDES_UPDATED' }, (payload) => {
        if (payload && payload.payload) {
          onSlidesUpdate(payload.payload);
        } else {
          onSlidesUpdate();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, () => {
        onSlidesUpdate();
      });

    return () => {};
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
    const channel = getHeroSlidesChannel();
    if (channel) {
      if (channel.state !== 'joined') {
        await new Promise(r => setTimeout(r, 150));
      }
      await channel.send({
        type: 'broadcast',
        event: 'HERO_SLIDES_UPDATED',
        payload: slidesData
      });
      console.log('[Supabase Realtime] Broadcasted hero slides to subscribers');
    }
  } catch (err) {
    console.warn('[Supabase Realtime] Broadcast hero slides error:', err.message);
  }
}

/**
 * Universal live reflection subscription for Food Items
 */
let _foodsChannel = null;
function getFoodsChannel() {
  if (!supabase) return null;
  if (!_foodsChannel) {
    _foodsChannel = supabase.channel('foods_channel');
    _foodsChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase Realtime] Connected to foods_channel');
      }
    });
  }
  return _foodsChannel;
}

export function subscribeToFoods(onFoodsUpdate) {
  if (!supabase) return () => {};

  try {
    const channel = getFoodsChannel();
    channel
      .on('broadcast', { event: 'FOODS_UPDATED' }, (payload) => {
        if (payload && payload.payload) {
          onFoodsUpdate(payload.payload);
        } else {
          onFoodsUpdate();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_items' }, () => {
        onFoodsUpdate();
      });

    return () => {};
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
    const channel = getFoodsChannel();
    if (channel) {
      if (channel.state !== 'joined') {
        await new Promise(r => setTimeout(r, 150));
      }
      await channel.send({
        type: 'broadcast',
        event: 'FOODS_UPDATED',
        payload: foodsData
      });
      console.log('[Supabase Realtime] Broadcasted foods to subscribers');
    }
  } catch (err) {
    console.warn('[Supabase Realtime] Broadcast foods error:', err.message);
  }
}

/**
 * Universal live reflection subscription for Categories
 */
let _categoriesChannel = null;
function getCategoriesChannel() {
  if (!supabase) return null;
  if (!_categoriesChannel) {
    _categoriesChannel = supabase.channel('categories_channel');
    _categoriesChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase Realtime] Connected to categories_channel');
      }
    });
  }
  return _categoriesChannel;
}

export function subscribeToCategories(onCategoriesUpdate) {
  if (!supabase) return () => {};

  try {
    const channel = getCategoriesChannel();
    channel
      .on('broadcast', { event: 'CATEGORIES_UPDATED' }, (payload) => {
        if (payload && payload.payload) {
          onCategoriesUpdate(payload.payload);
        } else {
          onCategoriesUpdate();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        onCategoriesUpdate();
      });

    return () => {};
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
    const channel = getCategoriesChannel();
    if (channel) {
      if (channel.state !== 'joined') {
        await new Promise(r => setTimeout(r, 150));
      }
      await channel.send({
        type: 'broadcast',
        event: 'CATEGORIES_UPDATED',
        payload: catsData
      });
      console.log('[Supabase Realtime] Broadcasted categories to subscribers');
    }
  } catch (err) {
    console.warn('[Supabase Realtime] Broadcast categories error:', err.message);
  }
}


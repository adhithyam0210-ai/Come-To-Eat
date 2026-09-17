import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[Supabase] Client initialized for live reflection.');
  } catch (err) {
    console.warn('[Supabase] Initialization error:', err.message);
  }
}

/**
 * Universal live reflection hook / subscription:
 * Seamlessly connects to Supabase Realtime channel if configured,
 * and maintains instant SSE live event streaming for zero-delay order reflection.
 */
export function subscribeToLiveOrders(onOrderUpdate) {
  const unsubscribers = [];

  // 1. Supabase Realtime Channel
  if (supabase) {
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
          console.log('[Supabase Realtime Status]:', status);
        });

      unsubscribers.push(() => {
        supabase.removeChannel(channel);
      });
    } catch (err) {
      console.warn('[Supabase Realtime Subscription Warning]:', err.message);
    }
  }

  // 2. Server-Sent Events (SSE) Live Stream for local / immediate reflection
  try {
    const sseBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const eventSource = new EventSource(`${sseBase}/realtime/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type !== 'CONNECTED' && data.data) {
          onOrderUpdate(data.data, data.type);
        }
      } catch (e) {
        // Ignore heartbeat/ping errors
      }
    };

    eventSource.onerror = () => {
      // EventSource handles automatic reconnection
    };

    unsubscribers.push(() => {
      eventSource.close();
    });
  } catch (err) {
    console.warn('[SSE Realtime stream error]:', err.message);
  }

  return () => {
    unsubscribers.forEach((fn) => {
      try { fn(); } catch (e) {}
    });
  };
}

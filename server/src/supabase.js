const { createClient } = require('@supabase/supabase-js');

// Support both standard SUPABASE and VITE_SUPABASE environment keys
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || null;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || null;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] Initialized Supabase Realtime client for live reflection.');
  } catch (err) {
    console.warn('[Supabase] Could not initialize Supabase client:', err.message);
  }
} else {
  console.log('[Supabase] Running with built-in live reflection engine (Supabase credentials optional in .env).');
}

// Active Server-Sent Events (SSE) connections for zero-latency local realtime reflection
const sseClients = new Set();

function registerSseClient(res) {
  sseClients.add(res);
  res.on('close', () => {
    sseClients.delete(res);
  });
}

/**
 * Optional Supabase Database reflection:
 * Upserts order record directly into Supabase PostgreSQL table 'orders' if configured
 */
async function syncOrderToSupabase(orderData) {
  if (!supabase || !orderData) return;
  try {
    const { error } = await supabase.from('orders').upsert({
      id: orderData.id,
      order_number: orderData.order_number,
      customer_name: orderData.customer_name || 'Customer',
      customer_phone: orderData.customer_phone || '',
      delivery_address: orderData.delivery_address || '',
      status: orderData.status,
      payment_method: orderData.payment_method,
      payment_status: orderData.payment_status,
      total_amount: orderData.total_amount,
      updated_at: new Date().toISOString()
    });
    if (error) {
      console.warn('[Supabase DB Reflection Warning]:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase DB Sync Exception]:', err.message);
  }
}

/**
 * Broadcast live order updates to all connected portals (Employee, Admin, Customer)
 * Broadcasts via Supabase Realtime Channel if configured, plus SSE stream for immediate reflection.
 */
async function broadcastLiveEvent(eventType, payload) {
  const eventMessage = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });

  // 1. Broadcast via SSE
  for (const client of sseClients) {
    try {
      client.write(`data: ${eventMessage}\n\n`);
    } catch (e) {
      sseClients.delete(client);
    }
  }

  // 2. Broadcast via Supabase channel if initialized
  if (supabase) {
    try {
      const channel = supabase.channel('orders_realtime');
      await channel.send({
        type: 'broadcast',
        event: eventType,
        payload
      });
      // Also reflect in Supabase database table
      if (payload && payload.id) {
        syncOrderToSupabase(payload);
      }
    } catch (err) {
      console.warn('[Supabase Broadcast Error]:', err.message);
    }
  }
}

module.exports = {
  supabase,
  registerSseClient,
  broadcastLiveEvent,
  syncOrderToSupabase
};

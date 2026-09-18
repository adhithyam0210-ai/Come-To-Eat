const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nvvrtqgpwsbxiruwtbho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52dnJ0cWdwd3NieGlydXd0YmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MzgxMTAsImV4cCI6MjEwNTIxNDExMH0.YSZGMuYOXfjsaPRWxms9eLz1FM2zLZDcNd2PTwBGUfw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOpsFixed() {
  console.log('--- Testing Fixed Food Items Insert & Delete ---');
  const foodPayload = {
    name: 'Test Food Fixed ' + Date.now(),
    slug: 'test-food-fixed-' + Date.now(),
    category_id: 1,
    price: 199,
    is_veg: 1,
    is_available: 1,
    is_featured: 0,
    prep_time: '15 min',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    description: 'Test food description'
  };

  const { data: newFood, error: foodErr } = await supabase.from('food_items').insert([foodPayload]).select().single();
  if (foodErr) {
    console.error('FAILED to insert food_item:', foodErr);
  } else {
    console.log('SUCCESS inserted food_item:', newFood);
    const { error: delFoodErr } = await supabase.from('food_items').delete().eq('id', newFood.id);
    if (delFoodErr) console.error('FAILED to delete food_item:', delFoodErr);
    else console.log('SUCCESS deleted food_item ID:', newFood.id);
  }

  console.log('\n--- Checking RLS status across all tables ---');
  const tables = ['hero_slides', 'categories', 'food_items', 'offer_banners', 'coupons', 'branches', 'restaurant_settings'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('id').limit(1);
    if (error) console.log(`Table ${t} read error:`, error.message);
    else console.log(`Table ${t} read SUCCESS, count sample:`, data.length);
  }
}

testOpsFixed();

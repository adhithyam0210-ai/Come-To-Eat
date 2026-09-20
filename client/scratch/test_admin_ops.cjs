const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testExplicitIdInsert() {
  console.log('--- Testing Insert with Explicit Max ID ---');
  
  const { data: foods } = await supabase.from('food_items').select('id').order('id', { ascending: false }).limit(1);
  const maxId = foods && foods.length > 0 ? Number(foods[0].id) : 0;
  const nextId = maxId + 1;

  const foodPayload = {
    id: nextId,
    name: 'Test Gourmet Burger ' + Date.now(),
    slug: 'test-gourmet-burger-' + Date.now(),
    category_id: 1,
    price: 299,
    discount_price: 249,
    is_veg: 1,
    is_available: 1,
    is_featured: 1,
    prep_time: '15 min',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    description: 'Test dish description'
  };

  const { data: newFood, error: foodErr } = await supabase.from('food_items').insert([foodPayload]).select().single();
  if (foodErr) {
    console.error('Insert with explicit ID failed:', foodErr.message);
  } else {
    console.log('SUCCESS inserted new food item with ID:', newFood.id, newFood.name);
    // Now test update
    const { data: updatedFood, error: updateErr } = await supabase.from('food_items').update({ price: 349 }).eq('id', newFood.id).select().single();
    if (updateErr) console.error('Update failed:', updateErr.message);
    else console.log('SUCCESS updated price to:', updatedFood.price);

    // Clean up
    await supabase.from('food_items').delete().eq('id', newFood.id);
    console.log('SUCCESS cleaned up test food item');
  }
}

testExplicitIdInsert();

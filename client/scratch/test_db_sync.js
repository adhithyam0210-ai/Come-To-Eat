import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    const { data: foods, error: foodsErr } = await supabase.from('food_items').select('*');
    console.log('Food Items in DB count:', foods ? foods.length : 0, 'Error:', foodsErr);

    const { data: cats, error: catsErr } = await supabase.from('categories').select('*');
    console.log('Categories in DB count:', cats ? cats.length : 0, 'Error:', catsErr);

    const { data: slides, error: slidesErr } = await supabase.from('hero_slides').select('*');
    console.log('Hero Slides in DB count:', slides ? slides.length : 0, 'Error:', slidesErr);

    const { data: offers, error: offersErr } = await supabase.from('offer_banners').select('*');
    console.log('Offers in DB count:', offers ? offers.length : 0, 'Error:', offersErr);

    const { data: orders, error: ordersErr } = await supabase.from('orders').select('*');
    console.log('Orders in DB count:', orders ? orders.length : 0, 'Error:', ordersErr);
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

checkTables();

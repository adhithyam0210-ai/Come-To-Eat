import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = envVars.VITE_SUPABASE_URL;
const anonKey = envVars.VITE_SUPABASE_ANON_KEY;
const serviceKey = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Testing Anon Key ---');
const supabaseAnon = createClient(url, anonKey);
const { data: foodsAnon, error: errAnon } = await supabaseAnon.from('food_items').select('*');
console.log('Anon Key foods count:', foodsAnon ? foodsAnon.length : 0, 'Error:', errAnon?.message);

console.log('\n--- Testing Service Role Key ---');
const supabaseService = createClient(url, serviceKey);
const { data: foodsService, error: errService } = await supabaseService.from('food_items').select('*');
console.log('Service Key foods count:', foodsService ? foodsService.length : 0, 'Error:', errService?.message);

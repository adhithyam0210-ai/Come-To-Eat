import { supabase } from '../src/utils/supabase.js';

console.log('--- Testing query using updated supabase.js exported client ---');

const { data: foods, error: errFoods } = await supabase.from('food_items').select('*');
console.log('Food items count:', foods ? foods.length : 0, 'Error:', errFoods?.message);

const { data: cats, error: errCats } = await supabase.from('categories').select('*');
console.log('Categories count:', cats ? cats.length : 0, 'Error:', errCats?.message);

const { data: slides, error: errSlides } = await supabase.from('hero_slides').select('*');
console.log('Hero slides count:', slides ? slides.length : 0, 'Error:', errSlides?.message);

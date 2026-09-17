const bcrypt = require('bcryptjs');
const { db, query, initSchema } = require('./database');

async function seedDatabase() {
  console.log('Seeding Come To Eat database...');
  await initSchema();

  // Clear existing data for fresh seed
  await query.run('DELETE FROM reviews');
  await query.run('DELETE FROM delivery_orders');
  await query.run('DELETE FROM payments');
  await query.run('DELETE FROM order_status_history');
  await query.run('DELETE FROM order_items');
  await query.run('DELETE FROM orders');
  await query.run('DELETE FROM addresses');
  await query.run('DELETE FROM food_addons');
  await query.run('DELETE FROM food_items');
  await query.run('DELETE FROM categories');
  await query.run('DELETE FROM coupons');
  await query.run('DELETE FROM admins');
  await query.run('DELETE FROM users');
  await query.run('DELETE FROM notifications');
  await query.run('DELETE FROM hero_slides');

  // 1. Admins & Staff
  const adminHashed = await bcrypt.hash('admin123', 10);
  await query.run(
    `INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ['Manager Sarah', 'admin@cometoeat.com', adminHashed, 'admin']
  );

  const employeeHashed = await bcrypt.hash('employee123', 10);
  await query.run(
    `INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ['Chef Vikram (Kitchen Staff)', 'chef@cometoeat.com', employeeHashed, 'employee']
  );

  // 2. Users
  const userHashed = await bcrypt.hash('user123', 10);
  const userRes = await query.run(
    `INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)`,
    ['Alex Rivera', 'alex@example.com', userHashed, '+91 98765 43210', 'user']
  );
  const alexId = userRes.lastID;

  // 3. User Addresses
  await query.run(
    `INSERT INTO addresses (user_id, label, street, city, landmark, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [alexId, 'Home', 'Flat 402, Green Glen Heights, HSR Layout Sector 2', 'Bengaluru', 'Near Agara Lake Park', '+91 98765 43210', 1]
  );
  await query.run(
    `INSERT INTO addresses (user_id, label, street, city, landmark, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [alexId, 'Work', '4th Floor, Tech Hub Tower, Outer Ring Road', 'Bengaluru', 'Opposite EcoSpace', '+91 98765 43210', 0]
  );

  // 4. Categories (from Image 5 customization requested by user)
  const categoryData = [
    {
      name: 'Burgers and Sandwiches',
      slug: 'burgers-and-sandwiches',
      description: 'Gourmet brioche burgers, flame-grilled patties and triple-decker gourmet sandwiches.',
      image_url: '/categories/burgers-and-sandwiches.jpg',
      sort_order: 1
    },
    {
      name: 'Momos',
      slug: 'momos',
      description: 'Authentic Himalayan steamed dumplings, spicy tandoori momos and pan-fried delicacies.',
      image_url: '/categories/momos.jpg',
      sort_order: 2
    },
    {
      name: 'Maggi',
      slug: 'maggi',
      description: 'Comforting café-style Maggi bowls loaded with butter, cheese, fiery tadka and veggies.',
      image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
      sort_order: 3
    },
    {
      name: 'Snacks',
      slug: 'snacks',
      description: 'Golden crispy finger bites, peri-peri loaded fries, nachos and mozzarella sticks.',
      image_url: '/categories/snacks.png',
      sort_order: 4
    },
    {
      name: 'Cold Beverages',
      slug: 'cold-beverages',
      description: 'Chilled gourmet thickshakes, velvety cold coffees and fruit blended smoothies.',
      image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
      sort_order: 5
    },
    {
      name: 'Mojito',
      slug: 'mojito',
      description: 'Sparkling refreshing coolers, crushed mint & lime coolers, and exotic fruit fizzes.',
      image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      sort_order: 6
    },
    {
      name: 'Pizzas',
      slug: 'pizzas',
      description: 'Stone-oven baked hand-stretched crust pizzas with molten cheese and rich herb tomato sauce.',
      image_url: '/categories/pizzas.png',
      sort_order: 7
    },
    {
      name: 'Boba Tea',
      slug: 'boba-tea',
      description: 'Signature Taiwanese bubble teas with chewy brown sugar pearls and fruit popping boba.',
      image_url: '/categories/boba-tea.png',
      sort_order: 8
    },
    {
      name: 'Pasta',
      slug: 'pasta',
      description: 'Silky handmade pastas tossed in rich Alfredo, fiery Arrabbiata and fragrant basil pesto.',
      image_url: '/categories/pasta.png',
      sort_order: 9
    }
  ];

  const categoryMap = {};
  for (const cat of categoryData) {
    const res = await query.run(
      `INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?)`,
      [cat.name, cat.slug, cat.description, cat.image_url, cat.sort_order]
    );
    categoryMap[cat.name] = res.lastID;
  }

  // 5. Food Items
  const foodItems = [
    // Burgers and Sandwiches
    {
      name: 'Classic Gourmet Smash Burger',
      slug: 'classic-gourmet-smash-burger',
      description: 'Double crisp-edged smash patty, caramelized onions, melted cheddar and house secret sauce on toasted brioche.',
      category_id: categoryMap['Burgers and Sandwiches'],
      price: 249,
      discount_price: 219,
      is_veg: 0,
      is_available: 1,
      prep_time: '15 min',
      is_featured: 1,
      rating: 4.8,
      rating_count: 42,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      tags: 'Bestseller, Chef Special'
    },
    {
      name: 'Crispy Zinger Paneer Burger',
      slug: 'crispy-zinger-paneer-burger',
      description: 'Thick marinated cottage cheese patty crusted in seasoned panko, iceberg lettuce and chipotle mayo.',
      category_id: categoryMap['Burgers and Sandwiches'],
      price: 219,
      discount_price: 189,
      is_veg: 1,
      is_available: 1,
      prep_time: '12 min',
      is_featured: 1,
      rating: 4.7,
      rating_count: 36,
      image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      tags: 'Vegetarian, Popular'
    },
    {
      name: 'Grilled Pesto Veggie Club Sandwich',
      slug: 'grilled-pesto-veggie-club-sandwich',
      description: 'Toasted sourdough layered with Genovese basil pesto, roasted zucchini, bell peppers and buffalo mozzarella.',
      category_id: categoryMap['Burgers and Sandwiches'],
      price: 199,
      discount_price: null,
      is_veg: 1,
      is_available: 1,
      prep_time: '10 min',
      is_featured: 0,
      rating: 4.6,
      rating_count: 24,
      image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
      tags: 'Healthy, Vegetarian'
    },
    {
      name: 'Triple Decker Smoked Chicken Ham Club',
      slug: 'triple-decker-smoked-chicken-ham-club',
      description: 'Stacked multi-grain sandwich with smoked chicken slices, fried egg, ripe tomatoes, crisp lettuce and honey mustard.',
      category_id: categoryMap['Burgers and Sandwiches'],
      price: 269,
      discount_price: 239,
      is_veg: 0,
      is_available: 1,
      prep_time: '15 min',
      is_featured: 1,
      rating: 4.9,
      rating_count: 51,
      image_url: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80',
      tags: 'Bestseller'
    },

    // Momos
    {
      name: 'Steamed Darjeeling Veg Momos (8 Pcs)',
      slug: 'steamed-darjeeling-veg-momos',
      description: 'Delicate thin dough pouches stuffed with minced seasonal veggies, ginger and fresh herbs, served with fiery red chutney.',
      category_id: categoryMap['Momos'],
      price: 159,
      discount_price: 139,
      is_veg: 1,
      is_available: 1,
      prep_time: '12 min',
      is_featured: 1,
      rating: 4.8,
      rating_count: 68,
      image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
      tags: 'Street Style, Authentic'
    },
    {
      name: 'Crispy Fried Chicken Momos (8 Pcs)',
      slug: 'crispy-fried-chicken-momos',
      description: 'Golden crunchy dumplings stuffed with juicy spiced minced chicken, served with spicy garlic mayo.',
      category_id: categoryMap['Momos'],
      price: 189,
      discount_price: null,
      is_veg: 0,
      is_available: 1,
      prep_time: '15 min',
      is_featured: 0,
      rating: 4.7,
      rating_count: 45,
      image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
      tags: 'Crispy, Non-Veg'
    },
    {
      name: 'Tandoori Paneer Momos in Spicy Marinade',
      slug: 'tandoori-paneer-momos',
      description: 'Char-grilled momos marinated in rich yogurt tandoori masala with charred onions, capsicum and mint dip.',
      category_id: categoryMap['Momos'],
      price: 199,
      discount_price: 179,
      is_veg: 1,
      is_available: 1,
      prep_time: '18 min',
      is_featured: 1,
      rating: 4.9,
      rating_count: 59,
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      tags: 'Tandoori, Bestseller'
    },
    {
      name: 'Cheese Burst Corn Momos (6 Pcs)',
      slug: 'cheese-burst-corn-momos',
      description: 'Dumplings oozing with molten mozzarella cheese, sweet corn kernels and subtle oregano seasoning.',
      category_id: categoryMap['Momos'],
      price: 199,
      discount_price: null,
      is_veg: 1,
      is_available: 1,
      prep_time: '14 min',
      is_featured: 0,
      rating: 4.6,
      rating_count: 31,
      image_url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
      tags: 'Cheesy'
    },

    // Maggi
    {
      name: 'Classic Café Butter Maggi',
      slug: 'classic-cafe-butter-maggi',
      description: 'Soul-warming 2-minute noodles cooked in aromatic spices and topped with a generous melting slab of salted butter.',
      category_id: categoryMap['Maggi'],
      price: 99,
      discount_price: null,
      is_veg: 1,
      is_available: 1,
      prep_time: '8 min',
      is_featured: 0,
      rating: 4.6,
      rating_count: 85,
      image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
      tags: 'Classic, Quick'
    },
    {
      name: 'Cheesy Tadka Volcano Maggi',
      slug: 'cheesy-tadka-volcano-maggi',
      description: 'Rich noodle bowl blended with molten cheddar, green chillies, garlic butter tadka and chili flakes.',
      category_id: categoryMap['Maggi'],
      price: 149,
      discount_price: 129,
      is_veg: 1,
      is_available: 1,
      prep_time: '10 min',
      is_featured: 1,
      rating: 4.9,
      rating_count: 94,
      image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      tags: 'Bestseller, Cheesy'
    },
    {
      name: 'Peri-Peri Vegetable Maggi',
      slug: 'peri-peri-vegetable-maggi',
      description: 'Zesty Maggi tossed with bell peppers, sweet corn, green peas and our fiery South African peri-peri dust.',
      category_id: categoryMap['Maggi'],
      price: 129,
      discount_price: null,
      is_veg: 1,
      is_available: 1,
      prep_time: '10 min',
      is_featured: 0,
      rating: 4.5,
      rating_count: 38,
      image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
      tags: 'Spicy'
    },

    // Snacks
    {
      name: 'Truffle Parmesan Fries',
      slug: 'truffle-parmesan-fries',
      description: 'Golden crispy skin-on potato fries tossed in black truffle oil, aged parmesan shreds and fresh rosemary.',
      category_id: categoryMap['Snacks'],
      price: 179,
      discount_price: 159,
      is_veg: 1,
      is_available: 1,
      prep_time: '10 min',
      is_featured: 1,
      rating: 4.9,
      rating_count: 73,
      image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
      tags: 'Gourmet, Crispy'
    },
    {
      name: 'Crispy Loaded Nachos Supreme',
      slug: 'crispy-loaded-nachos-supreme',
      description: 'Warm corn tortilla chips drenched in warm queso, pico de gallo, pickled jalapeños, sour cream and guacamole.',
      category_id: categoryMap['Snacks'],
      price: 219,
      discount_price: 199,
      is_veg: 1,
      is_available: 1,
      prep_time: '12 min',
      is_featured: 1,
      rating: 4.8,
      rating_count: 55,
      image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80',
      tags: 'Sharing, Cheesy'
    },
    {
      name: 'Golden Mozzarella Cheese Sticks',
      slug: 'golden-mozzarella-cheese-sticks',
      description: 'Herb breaded mozzarella batons fried golden brown with an epic cheese pull, served with marinara dip.',
      category_id: categoryMap['Snacks'],
      price: 189,
      discount_price: null,
      is_veg: 1,
      is_available: 1,
      prep_time: '10 min',
      is_featured: 0,
      rating: 4.7,
      rating_count: 41,
      image_url: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&w=800&q=80',
      tags: 'Kid Favorite'
    },

    // Cold Beverages
    {
      name: 'Belgian Chocolate Thickshake',
      slug: 'belgian-chocolate-thickshake',
      description: 'Rich slow-blended Belgian dark cocoa ganache, whole milk, chocolate fudge drizzle and whipped cream.',
      category_id: categoryMap['Cold Beverages'],
      price: 179,
      discount_price: 159,
      is_veg: 1,
      is_available: 1,
      prep_time: '6 min',
      is_featured: 1,
      rating: 4.9,
      rating_count: 88,
      image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
      tags: 'Signature, Indulgent'
    },
    {
      name: 'Classic Cold Coffee with Ice Cream',
      slug: 'classic-cold-coffee-with-ice-cream',
      description: 'Double espresso shot whipped with cold milk, crushed ice and a scoop of Madagascar vanilla bean gelato.',
      category_id: categoryMap['Cold Beverages'],
      price: 149,
      discount_price: null,
      is_veg: 1,
      is_available: 1,
      prep_time: '5 min',
      is_featured: 1,
      rating: 4.8,
      rating_count: 67,
      image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
      tags: 'Popular, Caffeine'
    },
    {
      name: 'Alphonso Mango & Yogurt Smoothie',
      slug: 'alphonso-mango-smoothie',
      description: 'Sun-ripened Ratnagiri mango pulp blended with Greek yogurt, honey and chia seeds for a healthy boost.',
      category_id: categoryMap['Cold Beverages'],
      price: 169,
      discount_price: 149,
      is_veg: 1,
      is_available: 1,
      prep_time: '5 min',
      is_featured: 0,
      rating: 4.8,
      rating_count: 49,
      image_url: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=800&q=80',
      tags: 'Healthy, Real Fruit'
    },

    // Mojito
    {
      name: 'Classic Mint & Lime Virgin Mojito',
      slug: 'classic-mint-lime-mojito',
      description: 'Hand-muddled garden mint leaves, fresh lime wedges, organic cane syrup topped with effervescent club soda.',
      category_id: categoryMap['Mojito'],
      price: 139,
      discount_price: 119,
      is_veg: 1,
      is_available: 1,
      prep_time: '4 min',
      is_featured: 1,
      rating: 4.7,
      rating_count: 62,
      image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      tags: 'Refreshing, Cool'
    },
    {
      name: 'Blue Curacao Ocean Breeze Mojito',
      slug: 'blue-curacao-ocean-mojito',
      description: 'Vibrant azure citrus mocktail infused with lime, crushed mint, blue curacao syrup and fizzy lemon soda.',
      category_id: categoryMap['Mojito'],
      price: 159,
      discount_price: null,
      is_veg: 1,
      is_available: 1,
      prep_time: '4 min',
      is_featured: 0,
      rating: 4.6,
      rating_count: 37,
      image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      tags: 'Exotic, Cold'
    },

    // Pizzas
    {
      name: 'Neapolitan Margherita Pizza (10")',
      slug: 'neapolitan-margherita-pizza',
      description: 'Hand-stretched sourdough base, San Marzano tomato sauce, fresh buffalo mozzarella, virgin olive oil and fresh basil.',
      category_id: categoryMap['Pizzas'],
      price: 349,
      discount_price: 299,
      is_veg: 1,
      is_available: 1,
      prep_time: '20 min',
      is_featured: 1,
      rating: 4.9,
      rating_count: 78,
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      tags: 'Chef Choice, Popular'
    },
    {
      name: 'Farmhouse Garden Delight Pizza (10")',
      slug: 'farmhouse-garden-delight-pizza',
      description: 'Loaded with button mushrooms, bell peppers, baby corn, black olives, red onions and melted mozzarella cheese.',
      category_id: categoryMap['Pizzas'],
      price: 389,
      discount_price: 349,
      is_veg: 1,
      is_available: 1,
      prep_time: '20 min',
      is_featured: 0,
      rating: 4.8,
      rating_count: 53,
      image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
      tags: 'Vegetarian'
    },
    {
      name: 'Spicy Peri-Peri Paneer Pizza (10")',
      slug: 'spicy-peri-peri-paneer-pizza',
      description: 'Cottage cheese cubes tossed in spicy peri-peri marinade, golden corn, jalapeños and stringy mozzarella.',
      category_id: categoryMap['Pizzas'],
      price: 399,
      discount_price: 359,
      is_veg: 1,
      is_available: 1,
      prep_time: '20 min',
      is_featured: 1,
      rating: 4.7,
      rating_count: 44,
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      tags: 'Spicy, Paneer'
    },
    {
      name: 'Smoky BBQ Chicken Feast Pizza (10")',
      slug: 'smoky-bbq-chicken-pizza',
      description: 'Tender pulled chicken tossed in hickory BBQ sauce, smoked gouda, red onion slices and fresh cilantro.',
      category_id: categoryMap['Pizzas'],
      price: 449,
      discount_price: 399,
      is_veg: 0,
      is_available: 1,
      prep_time: '22 min',
      is_featured: 1,
      rating: 4.9,
      rating_count: 65,
      image_url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
      tags: 'Non-Veg, Bestseller'
    },

    // Boba Tea
    {
      name: 'Brown Sugar Tiger Milk Boba',
      slug: 'brown-sugar-tiger-milk-boba',
      description: 'Slow-simmered Okinawa brown sugar caramel streaks, organic fresh milk and warm chewy tapioca boba pearls.',
      category_id: categoryMap['Boba Tea'],
      price: 219,
      discount_price: 189,
      is_veg: 1,
      is_available: 1,
      prep_time: '6 min',
      is_featured: 1,
      rating: 5.0,
      rating_count: 110,
      image_url: 'https://images.unsplash.com/photo-1558857563-b37cf5c490a6?auto=format&fit=crop&w=800&q=80',
      tags: 'Top Rated, Most Popular'
    },
    {
      name: 'Taro Cream Tapioca Boba',
      slug: 'taro-cream-tapioca-boba',
      description: 'Velvety purple taro root milk tea with a sweet cookie-butter undertone and soft brown sugar tapioca pearls.',
      category_id: categoryMap['Boba Tea'],
      price: 229,
      discount_price: 199,
      is_veg: 1,
      is_available: 1,
      prep_time: '6 min',
      is_featured: 1,
      rating: 4.8,
      rating_count: 52,
      image_url: 'https://images.unsplash.com/photo-1579887829663-6f10544f6f47?auto=format&fit=crop&w=800&q=80',
      tags: 'Taro, Sweet'
    },
    {
      name: 'Mango Passionfruit Popping Boba',
      slug: 'mango-passionfruit-popping-boba',
      description: 'Jasmine green tea infused with tropical mango and passionfruit nectar, loaded with bursting mango juice bubbles.',
      category_id: categoryMap['Boba Tea'],
      price: 199,
      discount_price: null,
      is_veg: 1,
      is_available: 1,
      prep_time: '5 min',
      is_featured: 0,
      rating: 4.7,
      rating_count: 39,
      image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
      tags: 'Fruity, Popping'
    },

    // Pasta
    {
      name: 'Creamy Tuscan Fettuccine Alfredo',
      slug: 'creamy-tuscan-fettuccine-alfredo',
      description: 'Silky egg fettuccine ribbon pasta enveloped in roasted garlic parmesan cream, butter, black pepper and parsley.',
      category_id: categoryMap['Pasta'],
      price: 289,
      discount_price: 259,
      is_veg: 1,
      is_available: 1,
      prep_time: '15 min',
      is_featured: 1,
      rating: 4.8,
      rating_count: 61,
      image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80',
      tags: 'Creamy, Classic'
    },
    {
      name: 'Penne Arrabbiata with Garlic Bread',
      slug: 'penne-arrabbiata-garlic-bread',
      description: 'Al dente penne pasta in a spicy slow-simmered San Marzano tomato sauce with garlic, chili flakes and extra virgin olive oil.',
      category_id: categoryMap['Pasta'],
      price: 269,
      discount_price: 239,
      is_veg: 1,
      is_available: 1,
      prep_time: '15 min',
      is_featured: 0,
      rating: 4.7,
      rating_count: 48,
      image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
      tags: 'Spicy, Italian'
    },
    {
      name: 'Wild Mushroom Aglio e Olio',
      slug: 'wild-mushroom-aglio-e-olio',
      description: 'Spaghetti gently tossed in golden roasted garlic, crushed red pepper, button & shiitake mushrooms and cold-pressed olive oil.',
      category_id: categoryMap['Pasta'],
      price: 299,
      discount_price: null,
      is_veg: 1,
      is_available: 1,
      prep_time: '15 min',
      is_featured: 0,
      rating: 4.6,
      rating_count: 33,
      image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      tags: 'Healthy, Vegan Option'
    }
  ];

  for (const item of foodItems) {
    const res = await query.run(
      `INSERT INTO food_items (name, slug, description, category_id, price, discount_price, is_veg, is_available, prep_time, is_featured, rating, rating_count, image_url, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.name,
        item.slug,
        item.description,
        item.category_id,
        item.price,
        item.discount_price,
        item.is_veg,
        item.is_available,
        item.prep_time,
        item.is_featured,
        item.rating,
        item.rating_count,
        item.image_url,
        item.tags
      ]
    );

    const foodId = res.lastID;

    // Add common add-ons based on category
    if (item.category_id === categoryMap['Burgers and Sandwiches'] || item.category_id === categoryMap['Maggi']) {
      await query.run(`INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`, [foodId, 'Extra Melted Cheese Slice', 35]);
      await query.run(`INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`, [foodId, 'Caramelized Onions & Jalapenos', 30]);
      await query.run(`INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`, [foodId, 'Spicy Peri-Peri Dip', 25]);
    } else if (item.category_id === categoryMap['Boba Tea']) {
      await query.run(`INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`, [foodId, 'Extra Tapioca Pearls', 35]);
      await query.run(`INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`, [foodId, 'Cheese Foam Topping', 40]);
      await query.run(`INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`, [foodId, 'Less Ice & Less Sweet (50%)', 0]);
    } else if (item.category_id === categoryMap['Pizzas'] || item.category_id === categoryMap['Pasta']) {
      await query.run(`INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`, [foodId, 'Extra Mozzarella Cheese', 60]);
      await query.run(`INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`, [foodId, 'Crushed Garlic Butter Dip', 35]);
      await query.run(`INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`, [foodId, 'Extra Sliced Black Olives & Jalapenos', 40]);
    } else if (item.category_id === categoryMap['Momos']) {
      await query.run(`INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`, [foodId, 'Extra Fiery Chilli Dip', 20]);
      await query.run(`INSERT INTO food_addons (food_id, name, price) VALUES (?, ?, ?)`, [foodId, 'Creamy Garlic Mayo Dip', 25]);
    }
  }

  // 6. Coupons
  const coupons = [
    { code: 'WELCOME50', discount_type: 'percentage', discount_value: 50, min_order_value: 199, max_discount: 100, expires_at: '2027-12-31' },
    { code: 'COMETO20', discount_type: 'percentage', discount_value: 20, min_order_value: 299, max_discount: 150, expires_at: '2027-12-31' },
    { code: 'FREESHIP', discount_type: 'flat', discount_value: 40, min_order_value: 249, max_discount: 40, expires_at: '2027-12-31' },
    { code: 'TASTY100', discount_type: 'flat', discount_value: 100, min_order_value: 499, max_discount: 100, expires_at: '2027-12-31' }
  ];

  for (const c of coupons) {
    await query.run(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [c.code, c.discount_type, c.discount_value, c.min_order_value, c.max_discount, c.expires_at]
    );
  }

  // 7. Demo Order with full timeline
  const orderNum = 'CTE-' + Math.floor(100000 + Math.random() * 900000);
  const sampleAddress = {
    street: 'Flat 402, Green Glen Heights, HSR Layout Sector 2',
    city: 'Bengaluru',
    landmark: 'Near Agara Lake Park',
    phone: '+91 98765 43210'
  };

  const sampleOrderRes = await query.run(
    `INSERT INTO orders (
      order_number, user_id, customer_name, customer_email, customer_phone, delivery_type,
      delivery_address_json, item_total, taxes, delivery_fee, discount_amount, coupon_code,
      final_amount, payment_method, payment_status, order_status, estimated_delivery_minutes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderNum,
      alexId,
      'Alex Rivera',
      'alex@example.com',
      '+91 98765 43210',
      'delivery',
      JSON.stringify(sampleAddress),
      408,
      20.4,
      40,
      100,
      'WELCOME50',
      368.4,
      'UPI (Google Pay)',
      'completed',
      'Preparing',
      25
    ]
  );
  const orderId = sampleOrderRes.lastID;

  // Order items
  const burgerFood = await query.get(`SELECT id FROM food_items WHERE name LIKE '%Smash Burger%' LIMIT 1`);
  const bobaFood = await query.get(`SELECT id FROM food_items WHERE name LIKE '%Boba%' LIMIT 1`);

  const burgerId = burgerFood ? burgerFood.id : 1;
  const bobaId = bobaFood ? bobaFood.id : 2;

  await query.run(
    `INSERT INTO order_items (order_id, food_id, food_name, unit_price, quantity, subtotal, selected_addons_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [orderId, burgerId, 'Classic Gourmet Smash Burger', 219, 1, 219, JSON.stringify([{ name: 'Extra Melted Cheese Slice', price: 35 }])]
  );
  await query.run(
    `INSERT INTO order_items (order_id, food_id, food_name, unit_price, quantity, subtotal, selected_addons_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [orderId, bobaId, 'Brown Sugar Tiger Milk Boba', 189, 1, 189, JSON.stringify([{ name: 'Extra Tapioca Pearls', price: 35 }])]
  );

  // Status history
  await query.run(
    `INSERT INTO order_status_history (order_id, old_status, new_status, comment) VALUES (?, ?, ?, ?)`,
    [orderId, null, 'Order Placed', 'Order placed successfully by Alex Rivera']
  );
  await query.run(
    `INSERT INTO order_status_history (order_id, old_status, new_status, comment) VALUES (?, ?, ?, ?)`,
    [orderId, 'Order Placed', 'Confirmed', 'Payment verified and restaurant accepted order']
  );
  await query.run(
    `INSERT INTO order_status_history (order_id, old_status, new_status, comment) VALUES (?, ?, ?, ?)`,
    [orderId, 'Confirmed', 'Preparing', 'Chef is crafting your gourmet burger and brewing fresh boba']
  );

  // Payment record
  await query.run(
    `INSERT INTO payments (order_id, user_id, amount, payment_method, transaction_id, status, gateway_response_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      orderId,
      alexId,
      368.4,
      'UPI',
      'TXN_' + Date.now(),
      'successful',
      JSON.stringify({ vpa: 'alex@okhdfcbank', gateway: 'Razorpay UPI Simulator', status: 'PAID' })
    ]
  );

  // Delivery order record (Third party delivery integration layer)
  await query.run(
    `INSERT INTO delivery_orders (
      order_id, provider, driver_name, driver_phone, tracking_code, pickup_address, drop_address, current_lat, current_lng, status, eta_minutes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderId,
      'Dunzo / ComeToEat Express',
      'Rohan Sharma',
      '+91 91234 56789',
      'TRK-' + Math.floor(100000 + Math.random() * 900000),
      'Come To Eat Café, 100 Feet Road, Indiranagar',
      sampleAddress.street + ', ' + sampleAddress.city,
      12.9716,
      77.5946,
      'driver_assigned',
      22
    ]
  );

  // Sample reviews
  await query.run(
    `INSERT INTO reviews (food_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)`,
    [burgerId, alexId, 'Alex Rivera', 5.0, 'One of the juiciest smash burgers in town! Bun was soft and buttery. Highly recommended!']
  );
  await query.run(
    `INSERT INTO reviews (food_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)`,
    [bobaId, alexId, 'Alex Rivera', 5.0, 'Brown sugar boba pearls were super warm and chewy. Perfect sweetness balance!']
  );

  // 7. Hero Banner Slides
  const heroSlides = [
    {
      tag: 'ORGANIC BLEND',
      script: 'Healthy Smoothie',
      title: 'Good Food. Good Mood. Come To Eat.',
      desc: 'Crafted with ripe hand-picked fruits, Greek yogurt, and pure mountain honey. Fuel your day with vibrant goodness and irresistible freshness.',
      image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80',
      button_text: 'Explore Menu',
      bg_color: '#949E7C',
      accent_text: 'Fresh Strawberries & Mint',
      target_category: 'Cold Beverages',
      sort_order: 1
    },
    {
      tag: 'CHEF SIGNATURE',
      script: 'Gourmet Burgers',
      title: 'Flame-Grilled Juicy Smash Burgers',
      desc: 'Double crisp-edged patties, molten aged cheddar, caramelized butter onions, and house secret sauce on warm toasted brioche buns.',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
      button_text: 'Explore Burgers',
      bg_color: '#8B9474',
      accent_text: 'Melted Cheddar & Brioche',
      target_category: 'Burgers and Sandwiches',
      sort_order: 2
    },
    {
      tag: 'TAIWANESE AUTHENTIC',
      script: 'Tiger Milk Boba',
      title: 'Brown Sugar Tapioca Bubble Tea',
      desc: 'Slow-simmered dark caramel streaks, organic fresh dairy, and warm chewy tapioca pearls brewed fresh every single morning.',
      image_url: 'https://images.unsplash.com/photo-1558857563-b37cf5c490a6?auto=format&fit=crop&w=900&q=80',
      button_text: 'Taste Boba',
      bg_color: '#969F82',
      accent_text: 'Warm Chewy Pearls',
      target_category: 'Boba Tea',
      sort_order: 3
    }
  ];

  for (const s of heroSlides) {
    await query.run(
      `INSERT INTO hero_slides (tag, script, title, desc, image_url, button_text, bg_color, accent_text, target_category, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.tag, s.script, s.title, s.desc, s.image_url, s.button_text, s.bg_color, s.accent_text, s.target_category, s.sort_order]
    );
  }

  console.log('Seeding completed successfully!');
  console.log('Admin account: admin@cometoeat.com / admin123');
  console.log('Employee account: chef@cometoeat.com / employee123');
  console.log('User account: alex@example.com / user123');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };

# Come To Eat - Direct Supabase Architecture (No Backend Server Needed)

This application runs **100% frontend-to-database** via `@supabase/supabase-js`. You do not need to run any Node.js or Express backend server.

---

## 🚀 Quick Setup Guide

### 1. Database Setup in Supabase
1. Open your [Supabase Dashboard](https://app.supabase.com).
2. Go to **SQL Editor** -> **New query**.
3. Copy and paste the contents of [`client/supabase_schema.sql`](file:///c:/Users/adhit/OneDrive/Desktop/Come%20To%20Eat/client/supabase_schema.sql).
4. Click **Run**. This will create all required tables (`orders`, `food_items`, `categories`, `branches`, `coupons`, `offer_banners`, `hero_slides`, `reviews`, `users`, `admins`, `restaurant_settings`, etc.) and seed initial demo data with Realtime enabled.

### 2. Configure Environment Variables
Ensure [`client/.env`](file:///c:/Users/adhit/OneDrive/Desktop/Come%20To%20Eat/client/.env) contains your Supabase project keys:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run the App
```bash
cd client
npm run dev
```

---

## 🔑 Default Login Credentials

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Executive Admin** | `admin@cometoeat.com` | `admin123` | `/admin` (Full Cafe Operations) |
| **Kitchen Staff (Employee)** | `chef@cometoeat.com` | `employee123` | `/employee` (Kitchen Live Orders & Food Out-of-Stock) |
| **Customer** | Register in UI or use any email | Any 4+ chars | Customer Portal / Ordering |

---

## ⚡ Direct Frontend Features
- **Direct PostgreSQL Operations**: Food menu browsing, branch selection, coupon validation, reviews, and store settings.
- **Supabase Realtime Live Reflection**: Zero-delay live order updates from the customer order placement to the kitchen staff portal.
- **Supabase Storage Uploads**: Food and banner image uploads direct to Supabase storage.

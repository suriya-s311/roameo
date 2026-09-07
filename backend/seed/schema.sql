-- ================================================================
-- ROAMEO Database Schema — Supabase PostgreSQL
-- Run this in the Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'traveler' CHECK (role IN ('traveler', 'seller')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SELLERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_description TEXT,
    udyam_number TEXT,
    udyam_verified BOOLEAN DEFAULT FALSE,
    shop_name TEXT NOT NULL,
    shop_description TEXT,
    shop_address TEXT,
    district TEXT,
    state TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT,
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ─── UDYAM REFERENCES (Demo/Prototype) ────────────────────────
CREATE TABLE IF NOT EXISTS udyam_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    udyam_number TEXT NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    business_type TEXT,
    district TEXT,
    state TEXT,
    date_of_registration TEXT,
    status TEXT DEFAULT 'active'
);

-- ─── DESTINATIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    state TEXT,
    district TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    image_url TEXT,
    category TEXT,
    highlights TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TOURIST SPOTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tourist_spots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    estimated_visit_duration INTEGER DEFAULT 60,
    estimated_entry_cost NUMERIC(10,2) DEFAULT 0,
    category TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tourist_spots_destination ON tourist_spots(destination_id);

-- ─── SHOPS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    district TEXT,
    state TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    verification_status TEXT DEFAULT 'unverified',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PRODUCTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price > 0),
    category TEXT,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);

-- ─── TRAVEL PLANS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS travel_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations(id),
    start_location TEXT NOT NULL,
    start_latitude DOUBLE PRECISION,
    start_longitude DOUBLE PRECISION,
    number_of_days INTEGER NOT NULL CHECK (number_of_days >= 1 AND number_of_days <= 30),
    budget_limit NUMERIC(10,2),
    estimated_budget NUMERIC(10,2),
    interests TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    start_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_travel_plans_user ON travel_plans(user_id);

-- ─── TRAVEL PLAN SPOTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS travel_plan_spots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    travel_plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
    tourist_spot_id UUID NOT NULL REFERENCES tourist_spots(id),
    day_number INTEGER NOT NULL CHECK (day_number >= 1),
    visit_order INTEGER NOT NULL CHECK (visit_order >= 1),
    estimated_cost NUMERIC(10,2) DEFAULT 0,
    estimated_duration INTEGER,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'visited', 'skipped')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_spots_plan ON travel_plan_spots(travel_plan_id);

-- ─── BUDGETS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    travel_plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE UNIQUE,
    transportation NUMERIC(10,2),
    food NUMERIC(10,2),
    shopping NUMERIC(10,2),
    other NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CART ITEMS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ─── ADDRESSES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    house_number TEXT NOT NULL,
    street TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES sellers(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','packed','shipped','in_transit','delivered','cancelled')),
    fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('carry_with_me', 'ship_to_home')),
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    tracking_number TEXT,
    shipping_date DATE,
    expected_delivery_date DATE,
    address_id UUID REFERENCES addresses(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);

-- ─── ORDER ITEMS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE udyam_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plan_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/write their own profile
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Service role bypasses RLS for backend operations
CREATE POLICY "Service role full access profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- Sellers: public read, own write
CREATE POLICY "Anyone can read sellers" ON sellers FOR SELECT USING (true);
CREATE POLICY "Service role full access sellers" ON sellers FOR ALL USING (auth.role() = 'service_role');

-- Udyam: read via service role
CREATE POLICY "Service role access udyam" ON udyam_references FOR ALL USING (auth.role() = 'service_role');

-- Destinations: public read
CREATE POLICY "Anyone can read destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Service role full access destinations" ON destinations FOR ALL USING (auth.role() = 'service_role');

-- Tourist spots: public read
CREATE POLICY "Anyone can read tourist spots" ON tourist_spots FOR SELECT USING (true);
CREATE POLICY "Service role full access spots" ON tourist_spots FOR ALL USING (auth.role() = 'service_role');

-- Shops: public read
CREATE POLICY "Anyone can read shops" ON shops FOR SELECT USING (true);
CREATE POLICY "Service role full access shops" ON shops FOR ALL USING (auth.role() = 'service_role');

-- Products: public read
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Service role full access products" ON products FOR ALL USING (auth.role() = 'service_role');

-- Travel plans: own read/write
CREATE POLICY "Users can read own travel plans" ON travel_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access travel plans" ON travel_plans FOR ALL USING (auth.role() = 'service_role');

-- Travel plan spots
CREATE POLICY "Users can read own plan spots" ON travel_plan_spots FOR SELECT USING (
    EXISTS (SELECT 1 FROM travel_plans WHERE travel_plans.id = travel_plan_spots.travel_plan_id AND travel_plans.user_id = auth.uid())
);
CREATE POLICY "Service role full access plan spots" ON travel_plan_spots FOR ALL USING (auth.role() = 'service_role');

-- Budgets
CREATE POLICY "Service role full access budgets" ON budgets FOR ALL USING (auth.role() = 'service_role');

-- Cart items: own only
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access cart" ON cart_items FOR ALL USING (auth.role() = 'service_role');

-- Addresses: own only
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access addresses" ON addresses FOR ALL USING (auth.role() = 'service_role');

-- Orders
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access orders" ON orders FOR ALL USING (auth.role() = 'service_role');

-- Order items
CREATE POLICY "Users can read own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Service role full access order items" ON order_items FOR ALL USING (auth.role() = 'service_role');

-- Notifications: own only
CREATE POLICY "Users can read own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');

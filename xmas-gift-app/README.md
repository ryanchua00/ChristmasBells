# 🎄 Christmas Gift Exchange

A magical Christmas gift management website for family gift exchanges! Built with Next.js, TailwindCSS, and Supabase.

## ✨ Features

- 🎅 **Simple Authentication**: Login with name + family password
- 🎁 **Gift Management**: Add, edit, delete gifts with optional links, prices, and images
- 🎄 **Reservation System**: Reserve gifts as secret Santa
- ❄️ **Christmas Theme**: Beautiful winter-themed UI with animations
- 🔔 **Christmas Toasts**: Festive success/error messages
- 📱 **Responsive Design**: Works on all devices

## 🚀 Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SITE_PASSWORD`: Keep as "roodsthepoods" or change as needed

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Make sure you've created the tables in Supabase using the SQL provided:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table  
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    link TEXT,
    price_range VARCHAR(100),
    image_url TEXT,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gifter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_items_author_id ON items(author_id);
CREATE INDEX idx_items_gifter_id ON items(gifter_id);
CREATE INDEX idx_users_name ON users(name);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the magic! 🎄

## 🎁 How to Use

1. **Login**: Enter your name and the family password ("roodsthepoods")
2. **Add Gifts**: Click "Add Gift" to add items to your wishlist
3. **Browse**: See everyone's wishlists organized by person
4. **Reserve**: Click "I'll Get This!" on others' gifts to reserve them
5. **Manage**: Edit or delete your own gifts anytime

## 🎨 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS with custom Christmas theme
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Language**: TypeScript

## 🎅 Vercel Deployment for Subdomain

Ready to deploy to your `xmas.ryanchuahj.com` subdomain!

### Option 1: Vercel CLI (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Configure custom domain in Vercel dashboard

### Option 2: GitHub Integration
1. Push to GitHub repository
2. Connect to Vercel via GitHub integration
3. Configure environment variables in Vercel dashboard
4. Set custom domain to `xmas.ryanchuahj.com`

### Environment Variables in Vercel
Set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key  
- `SITE_PASSWORD`: roodsthepoods (or your custom password)

### DNS Configuration
Add a CNAME record in your DNS provider:
- **Name**: `xmas`
- **Value**: `cname.vercel-dns.com`
- **TTL**: 300 (or default)

The `vercel.json` configuration ensures proper routing for your subdomain deployment.

## 🔔 Christmas Features

- ❄️ Animated snowfall background
- 🎄 Christmas color scheme (red, green, gold)
- 🎅 Festive toast messages
- ⭐ Twinkling animations
- 🎁 Christmas-themed icons and emojis

Merry Christmas and happy gift giving! 🎄✨

# Triple A Book Club

A modern, beautifully designed book club website built with Next.js 14, Supabase, and GSAP animations.

## Features

- **📚 Book Management** - Fiction (monthly) and Non-Fiction (bi-monthly) reading selections
- **🗳️ Voting System** - Members can suggest and vote for next month's books
- **👥 Member Profiles** - Showcase club members with social links
- **🖼️ Gallery** - Display photos and videos from club events
- **🔐 Authentication** - Secure login with Supabase Auth
- **⚡ Admin Dashboard** - Full control over content, portal status, and members
- **✨ Stunning Animations** - GSAP-powered transitions and horizontal scrolling

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Animations**: GSAP + Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account

### 1. Clone and Install

```bash
cd tripleabookclub
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file: `supabase/migration.sql`
3. Copy your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Set Up Admin User

1. Create an account through the website
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';
   ```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Login/Register pages
│   ├── about/             # About page
│   ├── books/             # Books listing
│   ├── gallery/           # Photo/Video gallery
│   ├── members/           # Member showcase
│   └── page.tsx           # Home page
├── components/
│   ├── admin/             # Admin components
│   ├── auth/              # Authentication forms
│   ├── books/             # Book-related components
│   ├── home/              # Home page sections
│   ├── layout/            # Navbar, Footer
│   ├── providers/         # Context providers
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── supabase/          # Supabase client setup
│   ├── store.ts           # Zustand stores
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript types
```

## Admin Features

Access the admin dashboard at `/admin` (requires super_admin role):

- **Books Manager** - Add, edit, delete books
- **Portal Control** - Open/close nominations and voting per month
- **Suggestions Manager** - Review and select winning books
- **Gallery Manager** - Upload photos and videos
- **Members Manager** - Manage displayed members
- **Site Content** - Edit page text content

## Key Functionality

### Book Suggestions
- Users can suggest up to 3 books per month per category
- Requires login to suggest
- Suggestions appear in voting when admin opens voting portal

### Voting System
- Each user can vote once per suggestion
- Vote counts are displayed and ranked
- Admin can select the winning book

### Portal Control
- Admin controls when nominations and voting are open
- Only one portal (nomination OR voting) can be open per category per month
- Separate controls for Fiction and Non-Fiction

## Customization

### Colors
Edit `tailwind.config.ts` to change the color scheme:
- `primary`: Main accent color (terracotta)
- `secondary`: Secondary color (teal)
- `accent`: Highlight color (gold)

### Content
Use the admin dashboard to edit:
- Hero section text
- About page content
- Add members and gallery items

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

```bash
npm run build
```

## License

MIT License - feel free to use for your book club!

---

Built with ❤️ for book lovers

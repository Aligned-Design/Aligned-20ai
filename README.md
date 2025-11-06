# Aligned AI - Intelligent Brand Content Platform

A full-featured brand content management platform with AI-powered content generation, approval workflows, and analytics.

## 🚀 What's Been Built

### ✅ Complete Features

1. **Authentication System** (Supabase Auth)
   - Email/password signup and login
   - Protected routes for authenticated users
   - Auto-assignment of demo brands to new users

2. **Brand Management**
   - Create and manage multiple brands
   - Brand switcher in sidebar
   - Brand-specific workspaces with row-level security
   - Color-coded brand identification

3. **Dashboard**
   - Overview widgets (content items, assets, engagement stats)
   - Recent activity feed
   - AI agent status monitoring
   - Monthly content engine status

4. **Content Calendar**
   - View all scheduled content items
   - Status tracking (draft, pending review, approved, published, rejected)
   - Platform-specific content (Instagram, LinkedIn, Facebook, etc.)
   - AI-generated content indicators

5. **Asset Library**
   - File management system
   - Search and filter assets
   - Tag-based organization
   - File type categorization

6. **Analytics Dashboard**
   - Performance metrics (reach, engagement, shares, comments)
   - Top-performing content analysis
   - Platform-specific analytics
   - AI Advisor Agent recommendations

7. **Database Schema**
   - Brands table with brand kits
   - Content items with approval workflow
   - Assets library
   - Analytics metrics
   - Role-based access control
   - Row-level security (RLS) policies

## 🎯 Three AI Agents (Ready for Integration)

The platform is structured to support three specialized AI agents:

1. **Doc Agent** ("Aligned Words") - Content generation
2. **Design Agent** ("Aligned Creative") - Visual asset creation
3. **Advisor Agent** ("Aligned Insights") - Analytics and recommendations

Currently, the UI and workflows are in place with placeholder data. Ready to integrate with OpenAI/Claude APIs.

## 📊 Demo Data

The platform includes three pre-seeded demo brands:

- **TechFlow Solutions** (Technology)
- **GreenLeaf Organics** (Food & Beverage)
- **Apex Fitness** (Health & Wellness)

New users automatically get admin access to all three demo brands upon signup.

## 🔐 Security Features

- Supabase Row-Level Security (RLS) enforced
- Brand isolation (users only see their own brands' data)
- Role-based permissions (owner, admin, manager, creator, approver, viewer)
- Encrypted credentials
- OAuth-ready for social login

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router 6
- **State**: React Context API
- **Date Utilities**: date-fns

## 📱 Pages & Routes

- `/` - Marketing homepage
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - Main dashboard (protected)
- `/brands` - Brand management (protected)
- `/calendar` - Content calendar (protected)
- `/assets` - Asset library (protected)
- `/analytics` - Analytics dashboard (protected)

## 🚧 Next Steps (Phase 2+)

As outlined in your specification:

1. **AI Integration**
   - Connect OpenAI/Claude APIs for Doc Agent
   - Integrate image generation for Design Agent
   - Build analytics AI for Advisor Agent

2. **Content Creation Workflows**
   - Content composer UI
   - Approval threading and feedback
   - Version history
   - Bulk scheduling

3. **Publishing Automation**
   - Social platform OAuth integrations
   - Auto-publishing to Instagram, Facebook, LinkedIn, X, Google Business
   - Publishing queue management

4. **Enhanced Analytics**
   - Real-time metrics sync from social platforms
   - Performance tracking over time
   - AI-powered insights and recommendations
   - Cross-brand benchmarking

5. **Asset Management**
   - File upload with Supabase Storage
   - Image editing and templates
   - Brand kit management (logos, fonts, colors)

6. **Monthly Content Engine**
   - Automated content generation schedule
   - Batch content creation
   - AI-driven content planning

7. **Mobile Experience**
   - Mobile-responsive approval workflows
   - Mobile app (React Native/PWA)

## 🔑 Getting Started

1. **Sign up** at `/signup`
2. Three demo brands will be automatically added to your account
3. Explore the **Dashboard** to see mock data
4. Create your own brand in **Brand Management**
5. View the **Calendar** to see scheduled content
6. Check **Analytics** for performance insights

## 🌐 Database Structure

See `supabase/migrations` for complete schema. Key tables:

- `brands` - Brand profiles and settings
- `brand_members` - User-brand relationships with roles
- `content_items` - Posts, blogs, emails, captions
- `approval_threads` - Review comments and feedback
- `assets` - Media library
- `analytics_metrics` - Performance data

## 📖 Environment Variables

Already configured:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## 🎨 Design System

Built with a modern, clean aesthetic inspired by Canva + Notion + Later:

- Primary color: Violet/Purple gradient (#8B5CF6)
- Accent: Fuchsia gradient
- Typography: Inter font family
- Rounded, card-based UI
- Subtle shadows and blur effects
- Brand-specific color coding

---

**Status**: ✅ Phase 1 Complete - Foundational platform ready for AI integration and feature expansion.

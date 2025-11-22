# PrepGenie - Claude Code Implementation Guide

**AI Meal Prep & Nutrition Planner**

This document provides step-by-step instructions for building PrepGenie using Claude Code, following the verified best practices from REQUIREMENTS.md.

---

## 🎯 Project Overview

**Tech Stack:**
- Next.js 16 RC (React 19, Server Components, Server Actions)
- TypeScript 5.9.2+
- Zustand 5.0.8+ (client state)
- TanStack Query 5.84.1+ (server state)
- Supabase 2.58.0+ (PostgreSQL, Auth, Storage)
- OpenAI 6.1.0+ (GPT-4o for meal generation)
- Tailwind CSS v4 + shadcn/ui
- Biome 2.2.4+ (linting/formatting)
- Vitest 4.0.7+ (testing)

---

## 📋 Implementation Phases

### Phase 1: Project Setup & Infrastructure (Current Phase)
- [x] Create REQUIREMENTS.md with verified tech stack
- [ ] Initialize Next.js 16 RC project
- [ ] Configure TypeScript, Biome, Tailwind CSS v4
- [ ] Set up Supabase project and database schema
- [ ] Configure environment variables
- [ ] Set up project folder structure (Atomic Design + Features)
- [ ] Initialize shadcn/ui
- [ ] Set up Zustand stores and TanStack Query

### Phase 2: Authentication & User Management
- [ ] Implement Supabase Auth with Server Actions
- [ ] Create middleware for route protection
- [ ] Build login/register pages
- [ ] Create multi-step onboarding flow
- [ ] User profile management
- [ ] TDEE & macro calculation utilities

### Phase 3: Core Features - Meal Management
- [ ] Meal database schema and RLS policies
- [ ] Meal library UI (Atomic Design components)
- [ ] Meal card components (molecules)
- [ ] Meal detail pages
- [ ] Meal creation/editing forms
- [ ] Real-time macro recalculation

### Phase 4: AI Integration - Meal Generation
- [ ] OpenAI integration setup
- [ ] Meal plan generation prompts
- [ ] Server Actions for AI calls
- [ ] Streaming UI for chat interface
- [ ] Error handling and retries
- [ ] Rate limiting

### Phase 5: Meal Planning & Grocery Lists
- [ ] Meal plan creation UI
- [ ] Weekly planner component (organism)
- [ ] Grocery list generation logic
- [ ] Ingredient consolidation algorithm
- [ ] Categorization and editing UI

### Phase 6: Progress Tracking & Analytics
- [ ] Progress logs schema
- [ ] Weight tracking UI
- [ ] Macro compliance charts (Recharts)
- [ ] Progress dashboard (organism)

### Phase 7: Testing & Optimization
- [ ] Unit tests (Vitest)
- [ ] Integration tests
- [ ] E2E testing setup
- [ ] Performance optimization
- [ ] React Compiler verification
- [ ] Bundle analysis

### Phase 8: Deployment & Production
- [ ] Supabase production setup
- [ ] Vercel deployment
- [ ] Environment variable configuration
- [ ] Monitoring setup
- [ ] Error tracking
- [ ] Analytics integration

---

## 🚀 Getting Started - Phase 1 Setup

### Step 1: Initialize Next.js 16 RC Project

```bash
# Create Next.js 16 RC app
pnpm create next-app@rc prep-genie --typescript --tailwind --app --use-pnpm

cd prep-genie
```

### Step 2: Install Core Dependencies

```bash
# Core dependencies
pnpm add next@rc react@rc react-dom@rc
pnpm add @tanstack/react-query@latest
pnpm add zustand@latest
pnpm add @supabase/supabase-js@latest @supabase/ssr@latest
pnpm add openai@latest
pnpm add nuqs@latest

# Forms & Validation
pnpm add react-hook-form@latest zod@latest @hookform/resolvers@latest

# UI & Utilities
pnpm add date-fns@latest lodash-es@latest
pnpm add lucide-react@latest sonner@latest
pnpm add next-themes@latest
pnpm add recharts@latest
pnpm add framer-motion@latest
pnpm add tailwind-merge@latest class-variance-authority@latest clsx@latest

# Dev dependencies
pnpm add -D typescript@latest
pnpm add -D @types/node@latest @types/react@latest @types/react-dom@latest @types/lodash-es@latest
pnpm add -D @biomejs/biome@latest
pnpm add -D vitest@latest @vitest/ui@latest @vitest/coverage-v8@latest
pnpm add -D @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest
pnpm add -D @vitejs/plugin-react@latest
pnpm add -D happy-dom@latest msw@latest
pnpm add -D husky@latest lint-staged@latest
```

### Step 3: Initialize shadcn/ui

```bash
npx shadcn@latest init

# Select options:
# - Style: Default
# - Base color: Zinc
# - CSS variables: Yes
```

```bash
# Add initial components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add slider
npx shadcn@latest add progress
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add label
npx shadcn@latest add toast
```

### Step 4: Configure Next.js 16

**File: `next.config.ts`**
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

export default nextConfig
```

### Step 5: Configure TypeScript

**File: `tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["ES2017", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Step 6: Configure Biome

**File: `biome.json`**
```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error"
      },
      "a11y": {
        "recommended": true
      },
      "correctness": {
        "useExhaustiveDependencies": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "asNeeded"
    }
  }
}
```

### Step 7: Configure Tailwind CSS v4

**File: `app/globals.css`**
```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 142 86% 28%;
    --primary-foreground: 356 29% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 45%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 142 86% 28%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 142 86% 28%;
    --primary-foreground: 356 29% 98%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 142 86% 28%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Step 8: Configure Vitest

**File: `vitest.config.mts`**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
        '.next/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**File: `tests/setup.ts`**
```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

### Step 9: Set Up Supabase

```bash
# Install Supabase CLI (if not already installed)
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase

# Initialize Supabase
supabase init

# Start local Supabase
supabase start
```

**File: `lib/supabase/server.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

**File: `lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File: `lib/supabase/middleware.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

**File: `middleware.ts`**
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Step 10: Create Supabase Database Schema

**File: `supabase/migrations/20250101000000_initial_schema.sql`**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  age INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal TEXT CHECK (goal IN ('weight_loss', 'maintain', 'muscle_gain', 'balanced')),
  dietary_preference TEXT CHECK (dietary_preference IN ('omnivore', 'vegetarian', 'vegan', 'pescatarian', 'halal')),
  allergies TEXT[],
  budget_level TEXT CHECK (budget_level IN ('low', 'medium', 'high')),
  cooking_skill_level TEXT CHECK (cooking_skill_level IN ('beginner', 'intermediate', 'advanced')),
  time_available INTEGER, -- minutes per day
  tdee INTEGER,
  daily_calorie_target INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fats INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meals Table
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions TEXT[],
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER DEFAULT 1,
  calories_per_serving INTEGER,
  protein_per_serving INTEGER,
  carbs_per_serving INTEGER,
  fats_per_serving INTEGER,
  tags TEXT[],
  cuisine_type TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  is_public BOOLEAN DEFAULT FALSE,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal Plans Table
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  type TEXT CHECK (type IN ('daily', 'weekly', 'custom')) DEFAULT 'weekly',
  total_calories INTEGER,
  total_protein INTEGER,
  total_carbs INTEGER,
  total_fats INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal Plan Items (Join Table)
CREATE TABLE meal_plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID REFERENCES meal_plans ON DELETE CASCADE NOT NULL,
  meal_id UUID REFERENCES meals ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  meal_time TEXT CHECK (meal_time IN ('breakfast', 'lunch', 'dinner', 'snack')),
  scheduled_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  servings INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meal_plan_id, day_of_week, meal_time)
);

-- Grocery Lists Table
CREATE TABLE grocery_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  meal_plan_id UUID REFERENCES meal_plans ON DELETE SET NULL,
  name TEXT NOT NULL,
  items JSONB NOT NULL, -- [{name, quantity, unit, category, is_purchased}]
  estimated_cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Meals (User Favorites)
CREATE TABLE saved_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  meal_id UUID REFERENCES meals ON DELETE CASCADE NOT NULL,
  notes TEXT,
  personal_rating INTEGER CHECK (personal_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, meal_id)
);

-- Progress Logs Table
CREATE TABLE progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  weight DECIMAL(5,2),
  calories_consumed INTEGER,
  protein_consumed INTEGER,
  carbs_consumed INTEGER,
  fats_consumed INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- AI Chat History Table
CREATE TABLE ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  messages JSONB NOT NULL, -- [{role, content, timestamp}]
  context_type TEXT CHECK (context_type IN ('meal_generation', 'nutrition_question', 'recipe_modification')),
  related_meal_id UUID REFERENCES meals ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_cuisine_type ON meals(cuisine_type);
CREATE INDEX idx_meals_meal_type ON meals(meal_type);
CREATE INDEX idx_meals_is_public ON meals(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plan_items_meal_plan_id ON meal_plan_items(meal_plan_id);
CREATE INDEX idx_grocery_lists_user_id ON grocery_lists(user_id);
CREATE INDEX idx_saved_meals_user_id ON saved_meals(user_id);
CREATE INDEX idx_progress_logs_user_id_date ON progress_logs(user_id, log_date DESC);
CREATE INDEX idx_ai_chat_history_user_id ON ai_chat_history(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for meals
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create meals"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for meal_plans
CREATE POLICY "Users can view own meal plans"
  ON meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for meal_plan_items
CREATE POLICY "Users can view own meal plan items"
  ON meal_plan_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own meal plan items"
  ON meal_plan_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

-- RLS Policies for grocery_lists
CREATE POLICY "Users can view own grocery lists"
  ON grocery_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own grocery lists"
  ON grocery_lists FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for saved_meals
CREATE POLICY "Users can view own saved meals"
  ON saved_meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved meals"
  ON saved_meals FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for progress_logs
CREATE POLICY "Users can view own progress logs"
  ON progress_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress logs"
  ON progress_logs FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for ai_chat_history
CREATE POLICY "Users can view own chat history"
  ON ai_chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own chat history"
  ON ai_chat_history FOR ALL
  USING (auth.uid() = user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON meals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_lists_updated_at
  BEFORE UPDATE ON grocery_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_chat_history_updated_at
  BEFORE UPDATE ON ai_chat_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 11: Create Environment Variables

**File: `.env.local`**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PrepGenie
NODE_ENV=development
```

**File: `.env.example`**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PrepGenie
NODE_ENV=development
```

### Step 12: Update package.json Scripts

**File: `package.json` (scripts section)**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit",
    "check": "pnpm run type-check && pnpm run lint && pnpm run test",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:types": "supabase gen types typescript --local > types/database.ts",
    "supabase:migration": "supabase migration new",
    "prepare": "husky install"
  }
}
```

### Step 13: Set Up Git Hooks

```bash
# Initialize Husky
npx husky install
npx husky add .husky/pre-commit "pnpm lint-staged"
```

**File: `.lintstagedrc.json`**
```json
{
  "*.{js,jsx,ts,tsx}": [
    "biome check --write",
    "biome format --write"
  ]
}
```

---

## 📁 Project Structure

```
prep-genie/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   ├── register/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   └── onboarding/
│   │       ├── page.tsx
│   │       └── components/
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── meals/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── meal-plans/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── generate/
│   │   │       └── page.tsx
│   │   ├── grocery-lists/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── progress/
│   │   │   └── page.tsx
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   └── webhooks/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
│
├── components/
│   ├── atoms/
│   │   └── ui/              # shadcn/ui components
│   ├── molecules/
│   │   ├── meal-card.tsx
│   │   ├── macro-display.tsx
│   │   ├── ingredient-item.tsx
│   │   └── nutrition-ring.tsx
│   ├── organisms/
│   │   ├── meal-planner/
│   │   ├── nutrition-dashboard/
│   │   ├── grocery-list/
│   │   └── chat-interface/
│   ├── templates/
│   │   ├── dashboard-layout.tsx
│   │   └── auth-layout.tsx
│   └── providers/
│       ├── query-provider.tsx
│       ├── store-provider.tsx
│       └── theme-provider.tsx
│
├── features/
│   ├── meals/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── meal-plans/
│   ├── grocery-lists/
│   ├── nutrition/
│   ├── ai-chat/
│   ├── progress/
│   └── auth/
│
├── lib/
│   ├── ai/
│   │   ├── openai.ts
│   │   ├── prompts/
│   │   │   ├── meal-plan-generator.ts
│   │   │   ├── grocery-list-generator.ts
│   │   │   ├── meal-modifier.ts
│   │   │   └── nutrition-assistant.ts
│   │   └── streaming.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── nutrition/
│   │   ├── tdee.ts
│   │   ├── macros.ts
│   │   └── conversions.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── format.ts
│   │   └── constants.ts
│   └── validations/
│       ├── user-profile.schema.ts
│       ├── meal.schema.ts
│       ├── meal-plan.schema.ts
│       └── grocery-list.schema.ts
│
├── stores/
│   ├── ui-store.ts
│   ├── meal-store.ts
│   └── index.ts
│
├── types/
│   ├── database.ts
│   ├── meal.ts
│   ├── nutrition.ts
│   └── user.ts
│
├── supabase/
│   ├── migrations/
│   │   └── 20250101000000_initial_schema.sql
│   ├── seed.sql
│   └── config.toml
│
├── tests/
│   ├── setup.ts
│   ├── unit/
│   ├── integration/
│   └── mocks/
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env.local
├── .env.example
├── .gitignore
├── biome.json
├── next.config.ts
├── tsconfig.json
├── vitest.config.mts
├── package.json
├── pnpm-lock.yaml
├── REQUIREMENTS.md
└── CLAUDE.md
```

---

## 🎨 Component Architecture (Atomic Design)

### Atoms (Basic UI Elements)
- Button, Input, Card, Badge, Label, Separator, Progress
- From shadcn/ui: `components/atoms/ui/`

### Molecules (Composite Components)
- `meal-card.tsx` - Displays meal with image, name, macros
- `macro-display.tsx` - Shows protein/carbs/fats breakdown
- `ingredient-item.tsx` - Single ingredient with quantity
- `nutrition-ring.tsx` - Circular macro chart
- `grocery-item.tsx` - Checkbox grocery list item

### Organisms (Complex Features)
- `meal-planner/` - Weekly meal calendar component
- `nutrition-dashboard/` - Stats, charts, progress
- `grocery-list/` - Full grocery list manager
- `chat-interface/` - AI chat UI with streaming

### Templates (Page Layouts)
- `dashboard-layout.tsx` - Main app layout with sidebar
- `auth-layout.tsx` - Centered auth forms

---

## 🔄 State Management Architecture

### Server State (TanStack Query)
- Meals data
- User profiles
- Meal plans
- Grocery lists
- Progress logs

**Example Query Hook:**
```typescript
// features/meals/hooks/use-meals.ts
import { useQuery } from '@tanstack/react-query'

export function useMeals() {
  return useQuery({
    queryKey: ['meals'],
    queryFn: async () => {
      // Fetch from Supabase
    }
  })
}
```

### Client State (Zustand)
- UI state (modals, sidebars)
- Filters and search
- Temporary form data
- User preferences

**Example Store:**
```typescript
// stores/ui-store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        toggleSidebar: () => set((state) => ({
          sidebarOpen: !state.sidebarOpen
        })),
      }),
      { name: 'ui-store' }
    )
  )
)
```

### URL State (nuqs)
- Search queries
- Filters
- Pagination

---

## 🚦 Next Steps

1. **Run the setup commands** above to initialize the project
2. **Apply Supabase migrations**: `pnpm supabase:reset`
3. **Generate TypeScript types**: `pnpm supabase:types`
4. **Start development**: `pnpm dev`
5. **Verify setup**: Visit `http://localhost:3000`

---

## 📚 Resources

- [REQUIREMENTS.md](./REQUIREMENTS.md) - Complete tech stack specification
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [shadcn/ui](https://ui.shadcn.com)

---

**Status**: Phase 1 Setup - Ready to Execute
**Next Phase**: Authentication & User Management

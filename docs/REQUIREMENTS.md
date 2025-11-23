# PrepGenie - AI Meal Prep & Nutrition Planner
## Tech Stack & Requirements Document

**✅ All versions and best practices verified with Context7 MCP (November 2025)**

---

## 📦 Quick Install

```bash
# Core dependencies
pnpm add next@rc react@rc react-dom@rc  # Next.js 16 RC + React 19
pnpm add @tanstack/react-query@latest
pnpm add zustand@latest  # Atomic state management
pnpm add @supabase/supabase-js@latest @supabase/ssr@latest
pnpm add openai@latest
pnpm add nuqs@latest

# Forms & Validation
pnpm add react-hook-form@latest zod@latest @hookform/resolvers@latest

# UI & Styling
pnpm add -D tailwindcss@latest autoprefixer@latest
pnpm add date-fns@latest lodash-es@latest

# Dev dependencies
pnpm add -D typescript@latest @types/node@latest @types/react@latest @types/react-dom@latest
pnpm add -D @biomejs/biome@latest
pnpm add -D vitest@latest @vitest/ui@latest @vitest/coverage-v8@latest
pnpm add -D @testing-library/react@latest @testing-library/jest-dom@latest
pnpm add -D husky@latest lint-staged@latest

# shadcn/ui (run after project setup)
npx shadcn@latest init
```

---

## 📋 Table of Contents

- [Product Overview](#product-overview)
- [Target Users](#target-users)
- [Core Features](#core-features)
- [Tech Stack Summary](#tech-stack-summary)
- [Architecture & Best Practices](#architecture--best-practices)
- [Core Framework](#core-framework)
- [Language & TypeScript](#language--typescript)
- [UI Framework & Components](#ui-framework--components)
- [State Management](#state-management)
- [Backend & Database](#backend--database)
- [AI Integration](#ai-integration)
- [Forms & Validation](#forms--validation)
- [Styling](#styling)
- [Testing](#testing)
- [Code Quality & Formatting](#code-quality--formatting)
- [Project Structure](#project-structure)
- [Implementation Guidelines](#implementation-guidelines)
- [Monetization Strategy](#monetization-strategy)

---

## Product Overview

### Value Proposition

PrepGenie provides:

- **AI-powered meal plans** tailored to individual fitness and health goals
- **Complete macro + calorie breakdown** for every meal
- **Weekly meal-prep schedules** with batch cooking workflows
- **Auto-generated grocery lists** with smart categorization
- **Real-time meal customization** and macro recalculation
- **ChatGPT nutrition assistant** for personalized guidance

---

## Target Users

1. **Fitness-focused users** - Bodybuilders, athletes, gym-goers tracking macros
2. **General health users** - People seeking balanced, sustainable nutrition
3. **Weight-loss users** - Individuals needing simple, effective meal plans
4. **Special dietary needs** - Vegetarian, vegan, halal, gluten-free, allergies

---

## Core Features

### 1. User Profile & Onboarding
- Multi-step form collecting: age, weight, height, gender, activity level
- Dietary preferences and allergies
- Goals: weight loss, maintain, muscle gain, balanced eating
- AI-calculated TDEE and target macros

### 2. AI Meal Generator
- ChatGPT-powered meal plan creation (daily/weekly)
- Customizable: cuisine type, meal complexity, time constraints
- Complete recipes with ingredients, instructions, nutrition data

### 3. Meal Prep Mode
- Batch cooking schedules
- Storage and reheating instructions
- Optimized cooking workflow

### 4. Grocery List Generator
- Automatic ingredient consolidation
- Smart categorization (produce, proteins, dairy, etc.)
- Editable quantities

### 5. Meal Library
- Save favorite meals
- Real-time macro editing
- Custom meal creation
- Tagging system

### 6. AI Nutrition Assistant
- ChatGPT-powered Q&A
- Ingredient substitutions
- Meal modifications
- Cultural adaptations

### 7. Recipe Nutrition Analyzer
- Paste any internet recipe URL or text
- AI extracts ingredients and portions
- Outputs complete nutrition breakdown:
  - Total calories
  - Macro distribution (protein, carbs, fats)
  - Per-serving calculations
- AI-suggested improvements:
  - Budget-friendly version (cheaper ingredients)
  - High-protein version (protein-optimized swaps)
  - Lower-calorie alternatives

### 8. Meal Swap System
- AI-powered intelligent meal replacements
- Swap criteria:
  - **Budget swap**: "Replace with cheaper ingredients"
  - **Speed swap**: "Faster cooking alternative"
  - **Dietary swap**: "Dairy-free / Gluten-free / Vegan version"
  - **Macro swap**: "Higher protein / Lower carb alternative"
- Maintains similar nutrition profile and satisfaction
- Preserves user preferences and dietary restrictions

### 9. Cultural Meal Modes
- Multi-cuisine support with authentic recipes:
  - **Japanese** - Traditional and modern Japanese cuisine
  - **Korean** - Korean BBQ, banchan, stews
  - **Mediterranean** - Greek, Italian, Middle Eastern
  - **Western** - American, British, European classics
  - **Halal** - Halal-certified ingredients and preparation
- Cuisine-specific:
  - Authentic ingredient recommendations
  - Traditional cooking methods
  - Cultural meal timing and portions

### 10. Internationalization (i18n)
- **Onboarding Language Selection**:
  - First step of onboarding: language selection (English or Japanese)
  - Large, clear language options with flags/icons
  - Sets locale for entire onboarding flow
  - Saves preference to user profile
- **Japanese Language Support**:
  - Full app translation (UI, recipes, AI responses)
  - Japanese-specific units:
    - Weight: kg only (no lb)
    - Height: cm only (no feet/inches)
    - Liquid: mL, L (Japanese cup = 200mL)
    - Cooking measurements: grams, Japanese cup/tablespoon sizes
  - Locale-aware date/time formatting
  - Japanese number formatting (e.g., ¥1,500)
- **English Language Support**:
  - Imperial and Metric unit selection:
    - Weight: lb or kg (user chooses during onboarding)
    - Height: feet/inches or cm (user chooses during onboarding)
    - Volume: oz, cups or mL, L
  - US date formatting
  - Currency formatting ($)
- **Implementation**:
  - next-intl for translations
  - Locale-aware number/date formatting
  - Unit conversion utilities
  - User preference storage in database
  - Language switcher in settings page

### 11. Settings Page
- **Profile Settings**:
  - Edit personal information (age, weight, height, gender)
  - Update activity level
  - Modify fitness goals (weight loss, maintain, muscle gain)
  - Update dietary preferences (omnivore, vegetarian, vegan, pescatarian, halal)
  - Manage allergies list
  - Adjust cooking skill level
  - Set daily time available for cooking
  - Update budget level
- **Language & Units**:
  - Language switcher (English ⇄ Japanese)
  - Unit system toggle (Imperial/Metric) - English only
  - Weight unit preference (kg or lb)
  - Height unit preference (cm or ft/in)
  - Volume unit preference (mL or cups/oz)
  - Currency display ($ or ¥)
- **Nutrition Targets**:
  - View current TDEE calculation
  - Manually adjust daily calorie target
  - Customize macro distribution (protein, carbs, fats)
  - Reset to AI-recommended values
- **Account Management**:
  - Change email
  - Update password
  - Manage email preferences
  - Export user data
  - Delete account
- **App Preferences**:
  - Dark/Light theme toggle
  - Notification settings
  - Default meal plan type (daily/weekly)
  - Preferred cuisine types
- **Implementation**:
  - Form validation with react-hook-form + Zod
  - Real-time TDEE recalculation on profile changes
  - Optimistic UI updates with TanStack Query
  - Confirmation dialogs for destructive actions
  - Success/error toasts with sonner

---

## Tech Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16 RC | React framework with RSC, Server Actions |
| **UI Library** | React | 19 RC | Server Components, React Compiler |
| **Language** | TypeScript | 5.9.2+ | Type safety |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS |
| **Components** | shadcn/ui | 3.5.0+ | Accessible UI components |
| **Server State** | TanStack Query | 5.84.1+ | Data fetching, caching, prefetching |
| **Client State** | Zustand | 5.0.8+ | Atomic state, persist middleware |
| **Database** | Supabase | 2.58.0+ | PostgreSQL, Auth, Real-time, Storage |
| **AI** | OpenAI | 6.1.0+ | GPT-5-nano for meal generation, streaming |
| **Testing** | Vitest | 4.0.7+ | Unit, integration testing |
| **Linting** | Biome | 2.2.4+ | Fast linting + formatting |

---

## Architecture & Best Practices

### ✅ Verified Patterns from Context7 MCP

#### Next.js 16 + React 19 Architecture

**Server Components First:**
- Default to Server Components for data fetching
- Use `'use client'` only when needed (interactivity, hooks)
- Async params/id in Next.js 16 (breaking change)

**Server Actions:**
- Form submissions without client-side JavaScript
- Type-safe with Zod validation
- Revalidation with `revalidatePath`

**Turbopack:**
- Enabled by default (no `--turbo` flag needed)
- Experimental filesystem caching: `turbopackFileSystemCacheForDev: true`

#### TanStack Query Best Practices

**Prefetching in Server Components:**
```typescript
// app/meals/page.tsx
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'

export default async function MealsPage() {
  const queryClient = new QueryClient()
  
  await queryClient.prefetchQuery({
    queryKey: ['meals'],
    queryFn: getMeals,
  })
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MealsClient />
    </HydrationBoundary>
  )
}
```

**Client Consumption:**
```typescript
'use client'
export function MealsClient() {
  const { data } = useQuery({ 
    queryKey: ['meals'], 
    queryFn: getMeals 
  })
  // Data available immediately, no re-fetch needed
}
```

#### Zustand Best Practices

**Store Provider Pattern for Next.js:**
```typescript
// providers/store-provider.tsx
'use client'
import { createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand'
import { createMealStore, type MealStore } from '@/stores/meal-store'

const StoreContext = createContext<ReturnType<typeof createMealStore> | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof createMealStore> | null>(null)
  if (!storeRef.current) {
    storeRef.current = createMealStore()
  }
  
  return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>
}

export function useMealStore<T>(selector: (store: MealStore) => T): T {
  const store = useContext(StoreContext)
  if (!store) throw new Error('Missing StoreProvider')
  return useStore(store, selector)
}
```

**Persist + Devtools Middleware:**
```typescript
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
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      }),
      { name: 'ui-store' }
    )
  )
)
```

**Immer for Complex State:**
```typescript
import { immer } from 'zustand/middleware/immer'

type TodoStore = {
  todos: Record<string, Todo>
  toggleTodo: (id: string) => void
}

export const useTodoStore = create<TodoStore>()(
  immer((set) => ({
    todos: {},
    toggleTodo: (id) => set((state) => {
      state.todos[id].done = !state.todos[id].done  // Direct mutation with Immer
    }),
  }))
)
```

#### Supabase Best Practices

**Server Component Auth:**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}  // Ignore if called from Server Component
        },
      },
    }
  )
}
```

**Server Actions:**
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  
  if (error) redirect('/error')
  
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
```

**Row Level Security (RLS):**
- Enable RLS on all tables
- Policies based on `auth.uid()`
- Secure by default

#### OpenAI Streaming Best Practices

**Server Action with Streaming:**
```typescript
'use server'
import OpenAI from 'openai'

const client = new OpenAI()

export async function generateMealPlan(userProfile: UserProfile) {
  try {
    const stream = await client.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [{
        role: 'system',
        content: 'You are a nutrition expert...'
      }, {
        role: 'user',
        content: JSON.stringify(userProfile)
      }],
      stream: true,
    })
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      // Stream to client
    }
  } catch (error) {
    if (error instanceof OpenAI.RateLimitError) {
      const retryAfter = error.headers?.['retry-after']
      // Handle rate limiting
    } else if (error instanceof OpenAI.APIConnectionError) {
      // Handle connection errors
    }
    throw error
  }
}
```

---

## Core Framework

### Next.js 16 (Release Candidate)
- **Version**: `16.0.0-rc` or `next@rc`
- **Installation**: `pnpm add next@rc react@rc react-dom@rc`

**Key Changes from Next.js 15:**
- ✅ **Async params/id**: Breaking change - `params` and `id` are now `Promise<T>`
- ✅ **Turbopack default**: No need for `--turbo` flag
- ✅ **cacheComponents**: Replaces `experimental.dynamicIO`
- ✅ **React Compiler**: Built-in with `reactCompiler: true`

**Configuration** (`next.config.ts`):
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,  // Faster rebuilds
  },
}

export default nextConfig
```

### React 19 (Release Candidate)
- **Version**: `19.0.0-rc` or `react@rc`
- **Features**:
  - Server Components
  - React Compiler (automatic memoization)
  - `use()` hook for async data
  - Actions and form improvements
  - Suspense enhancements

---

## Language & TypeScript

### TypeScript
- **Version**: `5.9.2+`
- **Installation**: `pnpm add -D typescript@latest`

**Configuration** (`tsconfig.json`):
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

---

## UI Framework & Components

### shadcn/ui
- **Version**: `3.5.0+`
- **Installation**: `npx shadcn@latest init`

**Atomic Design Structure:**
```
components/
├── atoms/          # button, input, card, badge
├── molecules/      # meal-card, macro-display, ingredient-item
├── organisms/      # meal-planner, nutrition-dashboard, chat-interface
├── templates/      # dashboard-layout, auth-layout
└── providers/      # query-provider, store-provider, theme-provider
```

**Key Components:**
- Radix UI primitives (accessible, unstyled)
- Tailwind CSS styling
- CVA for variants
- Dark mode support

---

## State Management

### TanStack Query
- **Version**: `5.84.1+`
- **Installation**: `pnpm add @tanstack/react-query@latest`

**Use Cases:**
- Server state (meals, profiles, plans)
- Prefetching in Server Components
- Optimistic updates
- Infinite scroll
- Real-time sync with Supabase

### Zustand
- **Version**: `5.0.8+`
- **Installation**: `pnpm add zustand@latest`

**Use Cases:**
- Client state (UI, modals, filters)
- Persistent state (user preferences)
- Complex nested state (with Immer)
- Form state across steps

**Why Zustand over Jotai:**
- ✅ Better Next.js integration patterns (verified via Context7)
- ✅ Built-in middleware (persist, devtools, immer)
- ✅ Simpler API for complex state
- ✅ Less re-renders with selector pattern

---

## Backend & Database

### Supabase
- **Version**: `2.58.0+`
- **Installation**: `pnpm add @supabase/supabase-js@latest @supabase/ssr@latest`
- **Requirements**: **Node.js 20.0.0+**

**Features:**
- PostgreSQL with Row Level Security
- Email/OAuth authentication
- Real-time subscriptions
- File storage
- Auto-generated TypeScript types

**Database Schema:**

```sql
-- User profiles with nutrition data
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  age INTEGER,
  weight DECIMAL,
  height DECIMAL,
  gender TEXT,
  activity_level TEXT,
  goal TEXT,
  dietary_preference TEXT,
  allergies TEXT[],
  tdee INTEGER,
  daily_calorie_target INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fats INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meals with full nutrition data
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  instructions TEXT[],
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  calories_per_serving INTEGER,
  protein_per_serving INTEGER,
  carbs_per_serving INTEGER,
  fats_per_serving INTEGER,
  tags TEXT[],
  cuisine_type TEXT,
  meal_type TEXT,
  is_public BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

## AI Integration

### OpenAI
- **Version**: `6.1.0+`
- **Installation**: `pnpm add openai@latest`

**Models:**
- `gpt-5-nano` - Primary model for meal generation, meal plans, chat
- `gpt-5-mini` - Alternative for more complex reasoning (optional)
- `gpt-5` / `gpt-5.1` - Advanced reasoning models (future upgrade path)

**Implementation:**

```typescript
// lib/ai/meal-generator.ts
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateMealPlan(userProfile: UserProfile) {
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: MEAL_PLANNER_PROMPT
      }, {
        role: 'user',
        content: JSON.stringify(userProfile)
      }],
      response_format: { type: 'json_object' },
    })
    
    return JSON.parse(completion.choices[0].message.content)
  } catch (error) {
    if (error instanceof OpenAI.RateLimitError) {
      // Handle rate limiting
    } else if (error instanceof OpenAI.APIConnectionError) {
      // Handle connection errors
    }
    throw error
  }
}
```

**Streaming for Chat:**
```typescript
export async function* streamNutritionChat(messages: Message[]) {
  const stream = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    stream: true,
  })
  
  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content || ''
  }
}
```

---

## Forms & Validation

### React Hook Form + Zod
- **Versions**: `react-hook-form@7.60.0+`, `zod@3.25.74+`

```typescript
// lib/validations/user-profile.schema.ts
import { z } from 'zod'

export const userProfileSchema = z.object({
  age: z.number().min(13).max(120),
  weight: z.number().positive(),
  height: z.number().positive(),
  gender: z.enum(['male', 'female', 'other']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['weight_loss', 'maintain', 'muscle_gain', 'balanced']),
  dietaryPreference: z.enum(['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'halal']),
  allergies: z.array(z.string()).optional(),
})

export type UserProfileForm = z.infer<typeof userProfileSchema>
```

---

## Styling

### Tailwind CSS v4
- **Version**: `4.0+`
- **Installation**: `pnpm add -D tailwindcss@latest autoprefixer@latest`

**New v4 Syntax:**
```css
/* app/globals.css */
@import "tailwindcss";
```

**Key Changes:**
- No `tailwind.config.ts` needed (uses `@import`)
- Built-in container queries
- Improved variant stacking (left-to-right)

---

## Testing

### Vitest
- **Version**: `4.0.7+`
- **Installation**: `pnpm add -D vitest@latest @vitest/ui@latest @vitest/coverage-v8@latest`

**Configuration** (`vitest.config.mts`):
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

---

## Code Quality & Formatting

### Biome
- **Version**: `2.2.4+`
- **Installation**: `pnpm add -D @biomejs/biome@latest`

**Configuration** (`biome.json`):
```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": { "noExplicitAny": "error" },
      "a11y": { "recommended": true }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

---

## Project Structure

```
prep-genie/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── onboarding/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── meals/
│   │   ├── meal-plans/
│   │   ├── grocery-lists/
│   │   ├── progress/
│   │   ├── chat/
│   │   └── settings/
│   ├── api/
│   │   └── webhooks/
│   └── layout.tsx           # StoreProvider, QueryProvider
│
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   └── providers/
│
├── features/                 # Feature-based architecture
│   ├── meals/
│   ├── meal-plans/
│   ├── grocery-lists/
│   ├── nutrition/
│   ├── ai-chat/
│   └── auth/
│
├── lib/
│   ├── ai/
│   │   ├── prompts/
│   │   └── streaming.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── nutrition/
│   │   ├── tdee.ts
│   │   └── macros.ts
│   ├── utils/
│   └── validations/
│
├── stores/                   # Zustand stores
│   ├── ui-store.ts
│   ├── meal-store.ts
│   └── index.ts
│
├── types/
│   └── database.ts
│
├── supabase/
│   └── migrations/
│
├── tests/
├── biome.json
├── next.config.ts
├── tsconfig.json
├── vitest.config.mts
└── package.json
```

---

## Implementation Guidelines

### 1. Server Components First
- Default to Server Components
- Prefetch data with TanStack Query
- Use Server Actions for mutations

### 2. State Management Strategy
- **Server state**: TanStack Query (meals, profiles, plans)
- **Client state**: Zustand (UI, filters, temporary data)
- **URL state**: nuqs (filters, search params)

### 3. Authentication Flow
- Supabase Auth with Server Actions
- Middleware for route protection
- RLS for data security

### 4. AI Integration
- Server Actions for OpenAI calls
- Streaming for chat interface
- Error handling with retries
- Rate limiting

### 5. Performance
- React Compiler (automatic memoization)
- Turbopack (fast dev builds)
- Route prefetching
- Image optimization

---

## Monetization Strategy

### Free Tier
- 3 AI meal plans/month
- 10 saved meals
- Basic tracking

### Pro Tier ($7-12/month)
- Unlimited meal plans
- Unlimited saved meals
- Advanced prep mode
- AI chat (unlimited)
- Progress dashboard
- Recipe analyzer

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Getting Started

```bash
# Install Next.js 16 RC
pnpm create next-app@rc prep-genie --typescript --tailwind --app

cd prep-genie

# Install dependencies
pnpm add next@rc react@rc react-dom@rc
pnpm add @tanstack/react-query@latest zustand@latest
pnpm add @supabase/supabase-js@latest @supabase/ssr@latest
pnpm add openai@latest nuqs@latest
pnpm add react-hook-form@latest zod@latest @hookform/resolvers@latest

# Dev dependencies
pnpm add -D @biomejs/biome@latest
pnpm add -D vitest@latest @vitest/ui@latest @vitest/coverage-v8@latest
pnpm add -D @testing-library/react@latest

# Initialize shadcn/ui
npx shadcn@latest init

# Start development
pnpm dev
```

---

**Project**: PrepGenie  
**Tech Stack**: Next.js 16, React 19, Zustand, Supabase, OpenAI  
**Status**: Ready for Development  
**Last Updated**: November 22, 2025

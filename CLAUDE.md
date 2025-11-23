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
- OpenAI 6.1.0+ (GPT-5-nano for meal generation)
- Tailwind CSS v4 + shadcn/ui
- Biome 2.2.4+ (linting/formatting)
- Vitest 4.0.7+ (testing)

---

## 🔒 CRITICAL: Type Safety Rules

**ALWAYS use Supabase generated types. NEVER use `any` type. NEVER create custom interfaces for database tables.**

### Generated Types Location
- `types/database.ts` - Auto-generated from Supabase schema (DO NOT format with Biome)
- `types/index.ts` - Type exports and utilities

### ✅ DO (Correct Usage)
```typescript
// Use generated types from @/types
import type { UserProfile, Meal, MealPlan, ProgressLog, GroceryList } from '@/types';

// For direct table access
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';
type Meal = Tables<'meals'>;
type MealInsert = TablesInsert<'meals'>;

// Component state with proper types
const [profile, setProfile] = useState<UserProfile | null>(null);
const [meals, setMeals] = useState<Meal[]>([]);

// Server Actions with generated types
export async function createMeal(data: TablesInsert<'meals'>) {
  const { data: meal } = await supabase.from('meals').insert(data);
  return meal;
}

// Only create interfaces for JSONB fields NOT in database schema
interface GroceryItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  is_purchased: boolean;
}
```

### ❌ DON'T (Wrong Usage)
```typescript
// ❌ NEVER use any type
const [data, setData] = useState<any>(null);
const items: any[] = [];

// ❌ NEVER create custom interfaces for database tables
interface CustomMeal {
  id: string;
  name: string;
  // ... This should use Meal from generated types!
}

// ❌ NEVER create duplicate types for tables
interface UserProfile {
  // ... Use generated UserProfile instead!
}
```

### Available Generated Types
- `UserProfile` - User profile data
- `Meal` - Meal/recipe data
- `MealPlan` - Weekly/daily meal plans
- `MealPlanItem` - Individual meal plan entries
- `GroceryList` - Shopping lists
- `ProgressLog` - Weight/nutrition tracking
- `SavedMeal` - User's favorite meals
- `AiChatHistory` - AI conversation logs

### Biome Configuration
- `types/database.ts` is **excluded from Biome formatting** (auto-generated file)
- `noExplicitAny: "error"` enforces no `any` types anywhere
- Always run `pnpm run lint:fix` after making changes

### Regenerating Types
```bash
# When database schema changes
pnpm supabase:types
```

---

## 🏗️ Architecture & Code Organization

### **CRITICAL: Strict Separation of Concerns**

This project follows a **feature-based architecture** with strict boundaries between UI, utilities, and business logic.

#### 1. **`components/` - UI Components ONLY**
**Purpose:** Pure presentational components without business logic.

**✅ ALLOWED:**
- Receive props and render UI
- Simple display calculations (e.g., `const totalTime = prep + cook`)
- Event handlers that call passed-in functions
- useState for UI-only state (modals, tooltips, dropdowns)

**❌ NOT ALLOWED:**
- Data fetching (no `fetch`, no Supabase queries)
- Business logic or domain calculations
- Complex state management
- Server Action definitions
- API calls

**Example (Correct):**
```typescript
// components/molecules/meal-card.tsx ✅
export function MealCard({ meal, onSave }: MealCardProps) {
  const totalTime = (meal.prep_time || 0) + (meal.cook_time || 0) // Simple display logic

  return (
    <Card>
      <h3>{meal.name}</h3>
      <p>{totalTime} min</p>
      <Button onClick={() => onSave(meal.id)}>Save</Button>
    </Card>
  )
}
```

---

#### 2. **`lib/` - Common Utilities ONLY**
**Purpose:** Shared, reusable utilities used across multiple features.

**✅ ALLOWED:**
- Infrastructure setup (Supabase client, OpenAI client)
- Shared utility functions (cn, format, constants)
- i18n utilities (unit conversion, locale formatting)
- Generic helpers (date formatting, string manipulation)

**❌ NOT ALLOWED:**
- Feature-specific business logic
- Domain calculations (TDEE, macros, nutrition)
- AI prompts
- Validation schemas (Zod)

**Example (Correct):**
```typescript
// lib/utils/format.ts ✅
export function formatCurrency(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(amount)
}

// lib/ai/openai.ts ✅
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
```

**Example (Incorrect - Move to features/):**
```typescript
// ❌ lib/nutrition/tdee.ts - This is BUSINESS LOGIC, belongs in features/nutrition/utils/
export function calculateTDEE(input: TDEEInput): number {
  const bmr = calculateBMR(input) // Domain calculation
  return Math.round(bmr * activityMultiplier)
}
```

---

#### 3. **`features/` - Business Logic & Domain Code**
**Purpose:** All feature-specific business logic, calculations, and data operations.

**✅ SHOULD CONTAIN:**
- **`actions.ts`** - Server Actions (NOT `api/actions.ts`)
- **`components/`** - Feature-specific components (if tightly coupled)
- **`hooks/`** - Feature-specific React hooks
- **`utils/`** - Feature-specific utility functions and calculations
- **`schemas/`** - Zod validation schemas
- **`prompts/`** - AI prompts (for features using AI)
- **`types/`** - Feature-specific TypeScript types

**Folder Structure:**
```
features/
├── [feature-name]/
│   ├── actions.ts              # Server Actions (module-level 'use server')
│   ├── components/             # Feature-specific components
│   ├── hooks/                  # Feature-specific hooks
│   ├── utils/                  # Feature-specific utilities
│   ├── schemas/                # Zod validation schemas
│   ├── prompts/                # AI prompts (if applicable)
│   └── types/                  # Feature-specific types
```

**Example (Correct - Server Actions):**
```typescript
// features/meals/actions.ts ✅
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMeal(data: TablesInsert<'meals'>) {
  const supabase = await createClient()
  const { data: meal, error } = await supabase.from('meals').insert(data).select().single()

  if (error) throw new Error(error.message)

  revalidatePath('/meals')
  return meal
}
```

**Example (Correct - Business Logic):**
```typescript
// features/nutrition/utils/tdee.ts ✅
export function calculateTDEE(input: TDEEInput): number {
  const bmr = calculateBMR(input)
  const activityMultiplier = ACTIVITY_MULTIPLIERS[input.activityLevel]
  return Math.round(bmr * activityMultiplier)
}
```

**Example (Correct - AI Prompts):**
```typescript
// features/meal-plans/prompts/meal-plan-generator.ts ✅
export function generateMealPlanPrompt(profile: UserProfile, locale: 'en' | 'ja') {
  return `Generate a personalized meal plan for...`
}
```

---

### **Server Actions: NO `api/` Subfolder**

**❌ OLD (Incorrect):**
```
features/
├── meals/
│   ├── api/
│   │   └── actions.ts          # ❌ Unnecessary nesting
```

**✅ NEW (Correct):**
```
features/
├── meals/
│   └── actions.ts               # ✅ Simplified, no api/ folder
```

**Why?**
- Server Actions are NOT API routes
- `app/api/*/route.ts` is for API route handlers
- Server Actions are just server-side functions
- Simpler imports: `@/features/meals/actions` vs `@/features/meals/api/actions`

**Usage:**
```typescript
// features/meals/actions.ts
'use server'

export async function createMeal(data: MealInsert) {
  // Server Action logic
}

// app/(app)/meals/new/page.tsx or components
import { createMeal } from '@/features/meals/actions'

export default function NewMealPage() {
  return <form action={createMeal}>...</form>
}
```

---

## 📋 Core Features Implementation Status

Based on REQUIREMENTS.md Core Features (11 features):

### ✅ Feature 1: User Profile & Onboarding - COMPLETED
- [x] Multi-step form collecting: age, weight, height, gender, activity level
- [x] Dietary preferences and allergies
- [x] Goals: weight loss, maintain, muscle gain, balanced eating
- [x] AI-calculated TDEE and target macros
- [x] Email confirmation flow
- [x] Smart redirect after authentication
- [x] Profile validation with Zod schemas

**Files:**
- `app/(auth)/onboarding/page.tsx`
- `features/auth/api/actions.ts`
- `lib/nutrition/tdee.ts`, `lib/nutrition/macros.ts`
- `lib/validations/user-profile.schema.ts`

### ✅ Feature 2: AI Meal Generator - COMPLETED
- [x] ChatGPT-powered meal plan creation (daily/weekly)
- [x] Customizable: cuisine type, meal complexity, time constraints
- [x] Complete recipes with ingredients, instructions, nutrition data
- [x] Meal prep mode fields (storage, reheating, batch cooking)
- [x] Server Action with streaming support
- [x] JSON parsing and validation

**Files:**
- `features/meal-plans/api/actions.ts` (`generateAIMealPlan`, `saveMealPlan`)
- `lib/ai/prompts/meal-plan-generator.ts`
- `lib/ai/openai.ts`

### ✅ Feature 3: Meal Prep Mode - COMPLETED
- [x] Batch cooking schedules (batch_cooking_multiplier field)
- [x] Storage and reheating instructions
- [x] Optimized cooking workflow
- [x] Meal prep friendly flag
- [x] Container type recommendations
- [x] Storage duration tracking
- [x] Database schema updated with 6 new fields
- [x] AI prompt updated to generate meal prep data

**Database Fields Added:**
- `storage_instructions` TEXT
- `reheating_instructions` TEXT
- `batch_cooking_multiplier` INTEGER
- `meal_prep_friendly` BOOLEAN
- `container_type` TEXT
- `storage_duration_days` INTEGER

### ✅ Feature 4: Grocery List Generator - COMPLETED
- [x] Automatic ingredient consolidation
- [x] Smart categorization (produce, proteins, dairy, etc.)
- [x] Editable quantities
- [x] Generate from meal plans
- [x] Shopping progress tracking
- [x] Estimated cost tracking

**Files:**
- `features/grocery-lists/api/actions.ts` (`generateGroceryListFromMealPlan`)
- `app/(app)/grocery-lists/page.tsx`
- `app/(app)/grocery-lists/[id]/page.tsx`

### ✅ Feature 5: Meal Library - COMPLETED
- [x] Save favorite meals
- [x] Real-time macro editing (via meal creation forms)
- [x] Custom meal creation
- [x] Tagging system
- [x] Search and filtering
- [x] Public/private meals
- [x] RLS policies

**Files:**
- `app/(app)/meals/page.tsx`
- `features/meals/api/actions.ts`
- `components/molecules/meal-card.tsx`

### ✅ Feature 6: AI Nutrition Assistant - COMPLETED
- [x] ChatGPT-powered Q&A
- [x] Ingredient substitutions
- [x] Meal modifications
- [x] Cultural adaptations (via general nutrition Q&A)
- [x] Streaming responses
- [x] Conversation history

**Files:**
- `app/(app)/chat/page.tsx`
- `features/ai-chat/api/actions.ts`
- `lib/ai/prompts/meal-plan-generator.ts` (includes `substituteIngredientPrompt`, `modifyMealPrompt`)

### ⏳ Feature 7: Recipe Nutrition Analyzer - PENDING
- [ ] Recipe URL/text input form
- [ ] AI extraction of ingredients and portions
- [ ] Complete nutrition breakdown display
- [ ] AI-powered improvement suggestions:
  - Budget version (cheaper ingredients)
  - High-protein version (protein-focused swaps)
  - Lower-calorie version (reduced calorie alternatives)
- [ ] Save analyzed recipes to meal library

**Implementation Plan:**
- Create `app/(app)/analyze/page.tsx` for recipe analyzer UI
- Create `lib/ai/prompts/recipe-analyzer.ts` for extraction prompts
- Create `features/recipes/api/actions.ts` for Server Actions
- Add recipe scraping/parsing logic
- Display nutrition comparison (original vs improved versions)

### ⏳ Feature 8: Meal Swap System - PENDING
- [ ] AI-powered meal replacement engine
- [ ] Swap criteria:
  - **Budget Swap**: Suggest cheaper ingredient alternatives
  - **Speed Swap**: Faster cooking methods, pre-prepped ingredients
  - **Dietary Swap**: Dairy-free, gluten-free, vegan alternatives
  - **Macro Swap**: Higher protein, lower carb versions
- [ ] Maintain nutrition profile and user preferences
- [ ] Single-click swap in meal plan view

**Implementation Plan:**
- Create `lib/ai/prompts/meal-swap.ts` for swap generation prompts
- Update `features/meal-plans/api/actions.ts` with swap Server Actions
- Add swap UI in meal plan detail pages
- Preserve user dietary preferences and allergen restrictions
- Cache common swaps for performance

### ⏳ Feature 9: Cultural Meal Modes - PENDING
- [ ] Expand cuisine types:
  - Japanese (authentic ingredients, cooking methods)
  - Korean (traditional recipes, ingredients)
  - Mediterranean (olive oil, fresh produce focus)
  - Western (standard American/European)
  - Halal (halal-certified ingredients, preparation)
- [ ] Authentic ingredient recommendations
- [ ] Cultural cooking method guidance
- [ ] Cuisine-specific meal planning templates

**Implementation Plan:**
- Update `lib/ai/prompts/meal-plan-generator.ts` with cuisine-specific templates
- Add cuisine type filter to meal library
- Create cuisine-specific ingredient databases
- Update user profile schema to include preferred cuisines
- Add cultural dietary restrictions to onboarding

### ⏳ Feature 10: Internationalization (i18n) - PENDING
- [ ] Onboarding language selection:
  - First step of onboarding flow
  - Large, clear language options (English / 日本語)
  - Flag/icon display for visual clarity
  - Sets locale for entire onboarding
  - Saves preference to user profile
- [ ] Japanese language support:
  - kg/cm measurements only (no imperial)
  - 200mL cup standard (not 240mL US cup)
  - Grams for cooking measurements
  - ¥ currency formatting
  - Japanese text throughout UI
  - AI responses in Japanese
- [ ] English language support:
  - Unit preference selection during onboarding (lb or kg, feet/inches or cm)
  - Imperial/Metric toggle in settings
  - $ currency formatting
  - Standard 240mL US cups
- [ ] Locale-aware formatting (dates, numbers, measurements)
- [ ] User preference storage in database
- [ ] Language switcher in settings page

**Implementation Plan:**
- Create language selection component for onboarding step 1
- Implement unit preference selection based on chosen language
- Add language switcher to settings page
- See detailed i18n implementation guide below.

### ⏳ Feature 11: Settings Page - PENDING
- [ ] Profile Settings section:
  - Edit personal info (age, weight, height, gender)
  - Update activity level and fitness goals
  - Modify dietary preferences and allergies
  - Adjust cooking skill and time available
  - Update budget level
- [ ] Language & Units section:
  - Language switcher (English ⇄ Japanese)
  - Unit system toggle (Imperial/Metric) - English only
  - Weight/Height/Volume unit preferences
  - Currency display preference
- [ ] Nutrition Targets section:
  - View current TDEE calculation
  - Manually adjust calorie/macro targets
  - Reset to AI-recommended values
- [ ] Account Management section:
  - Change email/password
  - Email preferences
  - Export user data
  - Delete account (with confirmation)
- [ ] App Preferences section:
  - Dark/Light theme toggle
  - Notification settings
  - Default meal plan type
  - Preferred cuisine types

**Implementation Plan:**
- Create `app/(app)/settings/page.tsx` with tabbed layout
- Create `features/settings/components/` for each settings section
- Create `features/settings/api/actions.ts` for update operations
- Use react-hook-form + Zod for form validation
- Implement optimistic UI updates with TanStack Query
- Add confirmation dialogs for destructive actions
- Real-time TDEE recalculation on profile changes

---

## 🌐 Internationalization (i18n) Implementation Guide

### Library: next-intl

**Why next-intl?**
- Built specifically for Next.js 16 App Router
- Server Component support
- Type-safe translations
- Locale-aware formatting (dates, numbers, units)
- Lightweight and performant

### Installation

```bash
pnpm add next-intl
```

### Step 1: Configure Next.js

**File: `next.config.ts`**
```typescript
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin()

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

export default withNextIntl(nextConfig)
```

### Step 2: Create i18n Request Configuration

**File: `i18n/request.ts`**
```typescript
import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const locales = ['en', 'ja'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async () => {
  // Get locale from cookie or default to 'en'
  const cookieStore = await cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as Locale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

### Step 3: Create Translation Files

**File: `messages/en.json`**
```json
{
  "common": {
    "app_name": "PrepGenie",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "error": "An error occurred"
  },
  "units": {
    "weight": "Weight",
    "height": "Height",
    "kg": "kg",
    "lb": "lb",
    "cm": "cm",
    "feet": "ft",
    "inches": "in",
    "grams": "g",
    "cups": "cups",
    "ml": "mL",
    "tablespoon": "tbsp",
    "teaspoon": "tsp"
  },
  "nutrition": {
    "calories": "Calories",
    "protein": "Protein",
    "carbs": "Carbs",
    "fats": "Fats",
    "daily_target": "Daily Target",
    "macros": "Macros"
  },
  "meals": {
    "breakfast": "Breakfast",
    "lunch": "Lunch",
    "dinner": "Dinner",
    "snack": "Snack",
    "meal_library": "Meal Library",
    "generate_meal_plan": "Generate Meal Plan",
    "ai_generated": "AI Generated"
  },
  "settings": {
    "language": "Language",
    "unit_system": "Unit System",
    "imperial": "Imperial (lb, ft, in)",
    "metric": "Metric (kg, cm)",
    "currency": "Currency"
  }
}
```

**File: `messages/ja.json`**
```json
{
  "common": {
    "app_name": "プレップジーニー",
    "save": "保存",
    "cancel": "キャンセル",
    "delete": "削除",
    "edit": "編集",
    "loading": "読み込み中...",
    "error": "エラーが発生しました"
  },
  "units": {
    "weight": "体重",
    "height": "身長",
    "kg": "kg",
    "cm": "cm",
    "grams": "g",
    "cups": "カップ",
    "ml": "mL",
    "tablespoon": "大さじ",
    "teaspoon": "小さじ"
  },
  "nutrition": {
    "calories": "カロリー",
    "protein": "タンパク質",
    "carbs": "炭水化物",
    "fats": "脂質",
    "daily_target": "1日の目標",
    "macros": "マクロ栄養素"
  },
  "meals": {
    "breakfast": "朝食",
    "lunch": "昼食",
    "dinner": "夕食",
    "snack": "軽食",
    "meal_library": "食事ライブラリ",
    "generate_meal_plan": "食事プランを生成",
    "ai_generated": "AI生成"
  },
  "settings": {
    "language": "言語",
    "unit_system": "単位システム",
    "metric": "メートル法 (kg, cm)",
    "currency": "通貨"
  }
}
```

### Step 4: Update Root Layout

**File: `app/layout.tsx`**
```typescript
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### Step 5: Create Unit Conversion Utilities

**File: `lib/i18n/units.ts`**
```typescript
export type WeightUnit = 'kg' | 'lb'
export type HeightUnit = 'cm' | 'ft_in'
export type VolumeUnit = 'ml' | 'cups_us' | 'cups_jp'
export type Currency = 'USD' | 'JPY'

export const JAPANESE_CUP_ML = 200
export const US_CUP_ML = 240

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value
  if (from === 'kg' && to === 'lb') return value * 2.20462
  if (from === 'lb' && to === 'kg') return value / 2.20462
  return value
}

export function convertHeight(value: number, from: HeightUnit, to: HeightUnit): number {
  if (from === to) return value
  if (from === 'cm' && to === 'ft_in') {
    const totalInches = value / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return feet + inches / 100 // Store as decimal (e.g., 5.11 = 5ft 11in)
  }
  if (from === 'ft_in' && to === 'cm') {
    const feet = Math.floor(value)
    const inches = Math.round((value - feet) * 100)
    return (feet * 12 + inches) * 2.54
  }
  return value
}

export function convertVolume(value: number, from: VolumeUnit, to: VolumeUnit): number {
  if (from === to) return value

  // Convert to mL first
  let ml = value
  if (from === 'cups_us') ml = value * US_CUP_ML
  if (from === 'cups_jp') ml = value * JAPANESE_CUP_ML

  // Convert from mL to target
  if (to === 'ml') return ml
  if (to === 'cups_us') return ml / US_CUP_ML
  if (to === 'cups_jp') return ml / JAPANESE_CUP_ML

  return value
}

export function formatCurrency(amount: number, currency: Currency, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}
```

### Step 6: Create Locale-Aware Formatting Hook

**File: `lib/i18n/use-locale-format.ts`**
```typescript
'use client'

import { useFormatter, useLocale } from 'next-intl'

export function useLocaleFormat() {
  const format = useFormatter()
  const locale = useLocale()

  const isJapanese = locale === 'ja'

  return {
    // Number formatting
    number: (value: number, options?: Intl.NumberFormatOptions) =>
      format.number(value, options),

    // Date formatting
    date: (date: Date, options?: Intl.DateTimeFormatOptions) =>
      format.dateTime(date, options),

    // Weight formatting
    weight: (value: number) => {
      if (isJapanese) {
        return `${format.number(value, { maximumFractionDigits: 1 })} kg`
      }
      // For English, use user preference (stored in profile)
      return `${format.number(value, { maximumFractionDigits: 1 })} kg` // Default to kg
    },

    // Height formatting
    height: (value: number) => {
      if (isJapanese) {
        return `${format.number(value, { maximumFractionDigits: 0 })} cm`
      }
      return `${format.number(value, { maximumFractionDigits: 0 })} cm`
    },

    // Volume formatting (cooking)
    volume: (value: number, unit: 'ml' | 'cups') => {
      if (unit === 'cups') {
        const cupSize = isJapanese ? 200 : 240
        return `${format.number(value)} カップ (${cupSize}mL)`
      }
      return `${format.number(value)} mL`
    },

    // Currency formatting
    currency: (value: number) => {
      const currency = isJapanese ? 'JPY' : 'USD'
      return format.number(value, {
        style: 'currency',
        currency,
      })
    },
  }
}
```

### Step 7: Update Database Schema for Locale Preferences

**File: `supabase/migrations/[timestamp]_add_locale_preferences.sql`**
```sql
ALTER TABLE user_profiles
ADD COLUMN locale TEXT CHECK (locale IN ('en', 'ja')) DEFAULT 'en',
ADD COLUMN unit_system TEXT CHECK (unit_system IN ('metric', 'imperial')) DEFAULT 'metric',
ADD COLUMN currency TEXT CHECK (currency IN ('USD', 'JPY')) DEFAULT 'USD';
```

### Step 8: Create Language Switcher Component

**File: `components/molecules/language-switcher.tsx`**
```typescript
'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select'

export function LanguageSwitcher() {
  const t = useTranslations('settings')
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  function onSelectChange(newLocale: string) {
    startTransition(async () => {
      // Set cookie for locale
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      })

      // Refresh page to apply new locale
      window.location.reload()
    })
  }

  return (
    <Select value={locale} onValueChange={onSelectChange} disabled={isPending}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t('language')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ja">日本語</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

### Step 9: Create Locale API Route

**File: `app/api/locale/route.ts`**
```typescript
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { locale } = await request.json()

  if (!['en', 'ja'].includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })

  return NextResponse.json({ success: true })
}
```

### Step 10: Update AI Prompts for Multilingual Support

**File: `lib/ai/prompts/meal-plan-generator.ts`**
```typescript
export function generateMealPlanPrompt(profile: UserProfile, locale: 'en' | 'ja') {
  const isJapanese = locale === 'ja'

  const systemPrompt = isJapanese
    ? `あなたはPrepGenieのAI食事プランジェネレーターです。特定の栄養目標を満たす、パーソナライズされたバランスの取れた食事プランを作成する専門家です。

**栄養精度:**
- 材料の量に基づいてマクロを計算
- タンパク質: 4kcal/g、炭水化物: 4kcal/g、脂質: 9kcal/g
- 合計カロリーはマクロ計算と一致する必要があります

**日本の測定単位:**
- カップ: 200mL（米国の240mLではありません）
- 重量: kg、g
- 温度: 摂氏（℃）

**回答形式:**
指定された構造に従った有効なJSONのみを返してください。マークダウンも説明も不要です。`
    : MEAL_PLAN_GENERATOR_SYSTEM_PROMPT

  // ... rest of prompt logic
}
```

### Usage in Components

**Example: Using translations in a component**
```typescript
'use client'

import { useTranslations } from 'next-intl'

export function MealCard() {
  const t = useTranslations('meals')

  return (
    <div>
      <h3>{t('breakfast')}</h3>
      <button>{t('ai_generated')}</button>
    </div>
  )
}
```

**Example: Using locale-aware formatting**
```typescript
'use client'

import { useLocaleFormat } from '@/lib/i18n/use-locale-format'

export function MacroDisplay({ calories, protein, carbs, fats }: Props) {
  const { number } = useLocaleFormat()

  return (
    <div>
      <p>Calories: {number(calories)}</p>
      <p>Protein: {number(protein)}g</p>
    </div>
  )
}
```

---

## 🏗️ Infrastructure Completed

### Project Setup ✅
- [x] Next.js 16 RC with React 19
- [x] TypeScript 5.9.2+ with strict mode
- [x] Biome 2.2.4+ for linting/formatting
- [x] Tailwind CSS v4 + shadcn/ui
- [x] Vitest 4.0.7+ testing setup
- [x] React Compiler enabled
- [x] Turbopack with filesystem caching

### Authentication & Database ✅
- [x] Supabase project (ID: nwuzxcpljlvwhpitwutf)
- [x] Complete database schema with RLS
- [x] Supabase Auth with email confirmation
- [x] Middleware/proxy for route protection
- [x] TypeScript types auto-generated from schema

### State Management ✅
- [x] Zustand for client state
- [x] TanStack Query for server state
- [x] nuqs for URL state

### Additional Features Implemented ✅
- [x] Progress tracking (weight, nutrition logs)
- [x] Saved meals (favorites)
- [x] AI chat history storage

---

## 🎯 Development Status

**Overall:** ~55% Complete (6/11 Core Features Implemented)

**Completed (6 features):**
- ✅ Feature 1: User Profile & Onboarding
- ✅ Feature 2: AI Meal Generator
- ✅ Feature 3: Meal Prep Mode
- ✅ Feature 4: Grocery List Generator
- ✅ Feature 5: Meal Library
- ✅ Feature 6: AI Nutrition Assistant

**In Progress (5 features):**
- ⏳ Feature 7: Recipe Nutrition Analyzer
- ⏳ Feature 8: Meal Swap System
- ⏳ Feature 9: Cultural Meal Modes
- ⏳ Feature 10: Internationalization (i18n)
- ⏳ Feature 11: Settings Page

**Next Steps:**
1. Install next-intl and configure i18n
2. Add language selection to onboarding (step 1)
3. Implement Settings Page with all sections
4. Implement Recipe Nutrition Analyzer
5. Implement Meal Swap System
6. Expand Cultural Meal Modes
7. Add multilingual AI responses

**Optional Enhancements (Not Required):**
- [ ] OAuth providers (Google, GitHub)
- [ ] Progress charts/visualizations (Recharts)
- [ ] E2E testing
- [ ] Performance monitoring

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

**NEW Architecture** (after refactoring):

```
prep-genie/
├── app/
│   ├── (auth)/                    # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── onboarding/
│   ├── (app)/                     # Protected app routes
│   │   ├── dashboard/
│   │   ├── meals/
│   │   ├── meal-plans/
│   │   ├── grocery-lists/
│   │   ├── progress/
│   │   ├── chat/
│   │   └── settings/
│   ├── api/
│   │   └── webhooks/              # API route handlers ONLY
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
│
├── components/                    # ✅ UI COMPONENTS ONLY (No business logic)
│   ├── atoms/
│   │   └── ui/                    # shadcn/ui components
│   ├── molecules/                 # Pure presentational components
│   │   ├── meal-card.tsx
│   │   ├── macro-display.tsx
│   │   ├── ingredient-item.tsx
│   │   ├── language-switcher.tsx
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
├── features/                      # ✅ BUSINESS LOGIC & DOMAIN CODE
│   ├── meals/
│   │   ├── actions.ts             # Server Actions (NOT api/actions.ts)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   │   └── meal.schema.ts     # Moved from lib/validations/
│   │   └── utils/
│   ├── meal-plans/
│   │   ├── actions.ts
│   │   ├── components/
│   │   ├── prompts/               # Moved from lib/ai/prompts/
│   │   │   ├── meal-plan-generator.ts
│   │   │   ├── meal-swap.ts
│   │   │   └── cultural-cuisine-guidelines.ts
│   │   ├── schemas/
│   │   │   └── meal-plan.schema.ts
│   │   └── utils/
│   ├── recipes/
│   │   ├── actions.ts
│   │   ├── components/
│   │   ├── prompts/
│   │   │   └── recipe-analyzer.ts
│   │   └── schemas/
│   ├── grocery-lists/
│   │   ├── actions.ts
│   │   └── schemas/
│   │       └── grocery-list.schema.ts
│   ├── nutrition/
│   │   └── utils/                 # Moved from lib/nutrition/
│   │       ├── tdee.ts
│   │       └── macros.ts
│   ├── ai-chat/
│   │   ├── actions.ts
│   │   └── prompts/
│   │       └── nutrition-assistant.ts
│   ├── user-profile/
│   │   ├── actions.ts
│   │   └── schemas/
│   │       └── user-profile.schema.ts
│   ├── settings/
│   │   ├── actions.ts
│   │   └── components/
│   ├── progress/
│   │   └── actions.ts
│   └── auth/
│       └── actions.ts
│
├── lib/                           # ✅ COMMON UTILITIES ONLY
│   ├── ai/
│   │   └── openai.ts              # OpenAI client setup (infrastructure)
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── i18n/
│   │   ├── units.ts               # Unit conversion utilities
│   │   └── use-locale-format.ts
│   └── utils/
│       ├── cn.ts
│       ├── format.ts
│       └── constants.ts
│
├── stores/                        # Zustand client state
│   ├── ui-store.ts
│   ├── meal-store.ts
│   └── index.ts
│
├── types/
│   ├── database.ts                # Auto-generated from Supabase
│   └── index.ts
│
├── messages/                      # i18n translations
│   ├── en.json
│   └── ja.json
│
├── supabase/
│   └── migrations/
│
├── tests/
│   ├── setup.ts
│   ├── unit/
│   ├── integration/
│   └── mocks/
│
├── public/
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

**Key Refactoring Changes:**
- ❌ Removed `lib/ai/prompts/` → ✅ Moved to `features/*/prompts/`
- ❌ Removed `lib/nutrition/` → ✅ Moved to `features/nutrition/utils/`
- ❌ Removed `lib/validations/` → ✅ Moved to `features/*/schemas/`
- ❌ Removed `features/*/api/` subfolder → ✅ Simplified to `features/*/actions.ts`

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

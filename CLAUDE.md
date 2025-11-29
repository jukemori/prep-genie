# PrepGenie - Claude Code Guide

**AI Meal Prep & Nutrition Planner** | Status: 100% Complete (11/11 Features)

## Tech Stack
- Next.js 16 RC (React 19, Server Components, Server Actions)
- TypeScript 5.9.2+ | Biome 2.2.4+ | Vitest 4.0.7+
- Zustand (client) + TanStack Query (server) + nuqs (URL)
- Supabase (PostgreSQL, Auth, Storage) | OpenAI (GPT-5-nano)
- Tailwind CSS v4 + shadcn/ui

---

## CRITICAL: Type Safety Rules

**ALWAYS use Supabase generated types. NEVER use `any`. NEVER create custom interfaces for database tables.**

```typescript
// ✅ DO: Use generated types
import type { UserProfile, Meal, MealPlan } from '@/types';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

// ✅ Only create interfaces for JSONB fields NOT in schema
interface GroceryItem { name: string; quantity: number; unit: string; }

// ❌ DON'T: Never use any or duplicate table types
const data: any = null;  // NEVER
interface CustomMeal {}   // NEVER - use Meal from generated types
```

**Available Types:** `UserProfile`, `Meal`, `MealPlan`, `MealPlanItem`, `GroceryList`, `ProgressLog`, `SavedMeal`, `AiChatHistory`

**Regenerate types:** `pnpm supabase:types`

---

## Architecture: Strict Separation of Concerns

### `components/` - UI ONLY
- Pure presentational, no business logic
- ✅ Props, render, simple display calcs, UI state (modals)
- ❌ No data fetching, no Supabase, no Server Actions

### `lib/` - Common Utilities ONLY
- ✅ Infrastructure (Supabase client, OpenAI client), shared helpers (cn, format)
- ❌ No feature logic, no domain calcs, no AI prompts, no Zod schemas

### `features/` - Business Logic & Domain Code
Each feature folder contains:
- `actions.ts` - Server Actions (NOT in `api/` subfolder)
- `components/` - Feature-specific components
- `hooks/` - Feature-specific hooks
- `utils/` - Domain calculations
- `schemas/` - Zod validation
- `prompts/` - AI prompts

```typescript
// features/meals/actions.ts ✅
'use server'
export async function createMeal(data: TablesInsert<'meals'>) {
  const supabase = await createClient()
  // ...
}
```

---

## Project Structure

```
app/
├── (auth)/          # login, register, onboarding
├── (app)/           # dashboard, meals, meal-plans, grocery-lists, settings, etc.
└── api/webhooks/    # API route handlers ONLY

components/
├── atoms/ui/        # shadcn/ui
├── molecules/       # meal-card, macro-display, etc.
├── organisms/       # complex features
├── templates/       # layouts
└── providers/       # query, store, theme

features/
├── meals/           # actions.ts, components/, hooks/, schemas/
├── meal-plans/      # + prompts/ for AI
├── recipes/
├── grocery-lists/
├── nutrition/utils/ # TDEE, macros
├── ai-chat/
├── settings/
├── progress/
└── auth/

lib/
├── ai/openai.ts
├── supabase/        # client, server, middleware
└── utils/           # cn, format, constants

types/
├── database.ts      # Auto-generated (excluded from Biome)
└── index.ts
```

---

## Key Commands

```bash
pnpm dev              # Start dev server
pnpm lint:fix         # Fix linting
pnpm type-check       # TypeScript check
pnpm supabase:types   # Regenerate types
pnpm test             # Run tests
```

---

## Completed Features

1. ✅ User Profile & Onboarding
2. ✅ AI Meal Generator
3. ✅ Meal Prep Mode
4. ✅ Grocery List Generator
5. ✅ Meal Library
6. ✅ AI Nutrition Assistant
7. ✅ Recipe Nutrition Analyzer
8. ✅ Meal Swap System
9. ✅ Cultural Meal Modes (Japanese, Korean, Mediterranean, Western, Halal)
10. ✅ Internationalization (i18n infrastructure ready)
11. ✅ Settings Page

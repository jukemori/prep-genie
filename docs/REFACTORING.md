# PrepGenie Refactoring Guide

This document outlines performance, architecture, and code quality improvements identified through codebase analysis using Context7 and Serena.

---

## Table of Contents

1. [Priority Matrix](#priority-matrix)
2. [Database Performance (Critical)](#database-performance-critical)
3. [Architecture Improvements](#architecture-improvements)
4. [Code Organization](#code-organization)
5. [Next.js Best Practices](#nextjs-best-practices)
6. [Implementation Checklist](#implementation-checklist)

---

## Priority Matrix

| Priority | Category | Issue | Impact | Effort |
|----------|----------|-------|--------|--------|
| P0 | Database | RLS policies using `auth.uid()` | High | Low |
| P0 | Database | Missing foreign key indexes | High | Low |
| P1 | Architecture | Missing React `cache()` | Medium | Low |
| P1 | UX | No `loading.tsx` files | Medium | Low |
| P1 | UX | No `error.tsx` files | Medium | Low |
| P2 | Code | Large action files (583+ lines) | Medium | Medium |
| P2 | Database | Duplicate indexes | Low | Low |

---

## Database Performance (Critical)

### 1. RLS Policy Optimization

**Issue**: 21 RLS policies use `auth.uid()` directly instead of `(select auth.uid())`.

**Why it matters**: Each time `auth.uid()` is called, it triggers a function evaluation. Using `(select auth.uid())` caches the result for the entire query execution, significantly improving performance for queries that check multiple rows.

**Location**: `supabase/migrations/20250101000000_initial_schema.sql`

**Current (Slow)**:
```sql
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);
```

**Optimized (Fast)**:
```sql
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING ((select auth.uid()) = id);
```

**Affected Tables** (21 policies total):
- `user_profiles` (3 policies)
- `meals` (4 policies)
- `meal_plans` (4 policies)
- `meal_plan_items` (4 policies)
- `grocery_lists` (4 policies)
- `progress_logs` (2 policies)

**Migration to create**:
```sql
-- Migration: optimize_rls_policies

-- user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- Repeat for all other tables...
```

---

### 2. Missing Foreign Key Indexes

**Issue**: Foreign keys without indexes cause slow JOIN operations.

**Potentially missing indexes** (verify with `\d+ table_name`):
- `meal_plan_items.meal_plan_id`
- `meal_plan_items.meal_id`
- `grocery_lists.meal_plan_id`
- `saved_meals.meal_id`
- `saved_meals.user_id`

**Migration to create**:
```sql
-- Migration: add_foreign_key_indexes

CREATE INDEX IF NOT EXISTS idx_meal_plan_items_meal_plan_id
  ON meal_plan_items(meal_plan_id);

CREATE INDEX IF NOT EXISTS idx_meal_plan_items_meal_id
  ON meal_plan_items(meal_id);

CREATE INDEX IF NOT EXISTS idx_grocery_lists_meal_plan_id
  ON grocery_lists(meal_plan_id);

CREATE INDEX IF NOT EXISTS idx_saved_meals_meal_id
  ON saved_meals(meal_id);

CREATE INDEX IF NOT EXISTS idx_saved_meals_user_id
  ON saved_meals(user_id);
```

---

### 3. Duplicate Indexes

**Issue**: Duplicate indexes waste storage and slow down writes.

Check for duplicates with:
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexdef;
```

---

## Architecture Improvements

### 1. React `cache()` for Data Memoization

**Issue**: No usage of React's `cache()` function found in the codebase.

**Why it matters**: React's `cache()` memoizes async function results during a single request, preventing duplicate database calls when the same data is accessed multiple times in a render tree.

**Current Pattern** (multiple calls):
```typescript
// app/(app)/meals/page.tsx
const meals = await getMeals()

// components somewhere in the tree
const meals = await getMeals() // DUPLICATE CALL
```

**Optimized Pattern**:
```typescript
// features/meals/queries.ts
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getMeals = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
})

export const getMealById = cache(async (id: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('meals')
    .select('*')
    .eq('id', id)
    .single()

  return data
})
```

**Recommended files to add**:
- `features/meals/queries.ts`
- `features/meal-plans/queries.ts`
- `features/grocery-lists/queries.ts`
- `features/settings/queries.ts`

---

### 2. Missing Loading States

**Issue**: No `loading.tsx` files found in the app directory.

**Why it matters**: Without `loading.tsx`, users see no feedback during page transitions, leading to poor perceived performance.

**Files to create**:

```typescript
// app/(app)/meals/loading.tsx
import { Skeleton } from '@/components/atoms/ui/skeleton'

export default function MealsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
```

**Locations needing loading.tsx**:
- `app/(app)/meals/loading.tsx`
- `app/(app)/meal-plans/loading.tsx`
- `app/(app)/meal-plans/[id]/loading.tsx`
- `app/(app)/grocery-lists/loading.tsx`
- `app/(app)/settings/loading.tsx`
- `app/(app)/dashboard/loading.tsx`

---

### 3. Missing Error Boundaries

**Issue**: No `error.tsx` files found in the app directory.

**Why it matters**: Without error boundaries, uncaught errors crash the entire application instead of showing a graceful fallback.

**Files to create**:

```typescript
// app/(app)/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/atoms/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground">
        We encountered an error while loading this page.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

**Locations needing error.tsx**:
- `app/(app)/error.tsx` (catch-all for app routes)
- `app/(auth)/error.tsx` (auth-specific errors)

---

## Code Organization

### 1. Large Action Files

**Issue**: Action files are becoming too large and handling too many responsibilities.

| File | Lines | Recommendation |
|------|-------|----------------|
| `features/meal-plans/actions.ts` | 583 | Split into 3 files |
| `features/meals/actions.ts` | 356 | Split into 2 files |
| `features/grocery-lists/actions.ts` | 191 | OK |
| `features/recipes/actions.ts` | 130 | OK |

**Recommended split for meal-plans**:
```
features/meal-plans/
├── actions/
│   ├── index.ts           # Re-exports all actions
│   ├── crud.ts            # create, update, delete meal plans
│   ├── generation.ts      # generateInstantMealPlan, AI generation
│   └── meal-management.ts # addMealToMealPlan, swapMeal, removeMeal
```

**Recommended split for meals**:
```
features/meals/
├── actions/
│   ├── index.ts           # Re-exports all actions
│   ├── crud.ts            # getMeal, createMeal, updateMeal, deleteMeal
│   └── generation.ts      # generateMeal, AI-related actions
```

---

## Next.js Best Practices

### 1. Optimize Supabase Queries with Request Deduplication

Use unstable_cache for expensive queries that don't need real-time data:

```typescript
import { unstable_cache } from 'next/cache'

export const getCachedUserProfile = unstable_cache(
  async (userId: string) => {
    const supabase = await createClient()
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data
  },
  ['user-profile'],
  { revalidate: 60, tags: ['user-profile'] }
)
```

### 2. Use Parallel Data Fetching

**Current** (sequential):
```typescript
const meals = await getMeals()
const profile = await getProfile()
```

**Optimized** (parallel):
```typescript
const [meals, profile] = await Promise.all([
  getMeals(),
  getProfile(),
])
```

---

## Implementation Checklist

### Phase 1: Database (Critical - Do First)
- [ ] Create migration for RLS policy optimization
- [ ] Create migration for missing FK indexes
- [ ] Verify and remove duplicate indexes
- [ ] Run `pnpm supabase:types` after migrations

### Phase 2: UX Improvements
- [ ] Add `loading.tsx` to all app routes
- [ ] Add `error.tsx` for error boundaries
- [ ] Test loading states across routes

### Phase 3: Architecture
- [ ] Create `queries.ts` files with `cache()` wrapper
- [ ] Update page components to use cached queries
- [ ] Verify no duplicate database calls

### Phase 4: Code Organization
- [ ] Split `features/meal-plans/actions.ts` into modules
- [ ] Split `features/meals/actions.ts` into modules
- [ ] Update all imports
- [ ] Run tests to verify no regressions

---

## Resources

- [Supabase RLS Performance](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
- [Next.js Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React cache()](https://react.dev/reference/react/cache)

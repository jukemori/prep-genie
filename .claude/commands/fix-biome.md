---
description: Fix all Biome linting, formatting, and TypeScript errors
---

**Step 1: Run Biome auto-fix**
```bash
pnpm run lint:fix
```

**Step 2: Check TypeScript errors**
```bash
pnpm tsc --noEmit
```

**Step 3: Fix all errors systematically**

DO NOT just summarize the errors. You MUST fix all errors found using these tools:

## Fixing Biome Errors

1. **Use Serena MCP to locate errors:**
   - `mcp__serena__search_for_pattern` - Find problematic code patterns
   - `mcp__serena__get_symbols_overview` - Understand file structure
   - `mcp__serena__find_symbol` - Read specific functions/classes with errors

2. **Use Context7 MCP for solutions:**
   - `mcp__context7__resolve-library-id` for "biomejs"
   - `mcp__context7__get-library-docs` with error code for rule documentation

3. **Apply fixes:**
   - `mcp__serena__replace_symbol_body` for symbol-level fixes
   - Use Edit tool for line-by-line corrections
   - Follow type safety rules from CLAUDE.md

## Fixing TypeScript Errors

1. **For module resolution errors:**
   - Check tsconfig.json path aliases
   - Verify file locations match imports
   - Use `mcp__serena__find_file` to locate correct paths

2. **For implicit `any` errors:**
   - Add explicit types to all parameters
   - Use React event types: `React.FormEvent`, `React.ChangeEvent`, etc.
   - Never use `any` type (use proper Supabase generated types)

3. **For null safety errors:**
   - Add null checks before using nullable values
   - Use optional chaining `?.` and nullish coalescing `??`

4. **For Zod errors:**
   - Replace `error.errors` with `error.issues`

5. **For type mismatches:**
   - Use proper OpenAI/library types from their type definitions
   - Import and use Supabase generated types from `@/types`

## After Fixing

Run both commands again to verify all errors are resolved:
```bash
pnpm run lint:fix && pnpm tsc --noEmit
```

Only stop when BOTH commands show zero errors.

## CRITICAL Type Safety Rules

**ALWAYS use Supabase generated types from `types/database.ts` and `types/index.ts`:**
- ✅ Use `UserProfile`, `Meal`, `MealPlan`, `ProgressLog`, `GroceryList` types
- ✅ Use `Tables<'table_name'>`, `TablesInsert<'table_name'>`, `TablesUpdate<'table_name'>`
- ❌ NEVER create custom interfaces for database tables
- ❌ NEVER use `any` type (enforced by Biome `noExplicitAny: "error"`)
- ⚠️ Only create minimal interfaces for JSONB fields not in schema (e.g., `GroceryItem`, `Ingredient`)

**Examples:**
```typescript
// ✅ CORRECT - Use generated types
import type { UserProfile, Meal, ProgressLog } from '@/types';
const [profile, setProfile] = useState<UserProfile | null>(null);
const meals: Meal[] = [];

// ❌ WRONG - Don't create custom interfaces
interface CustomMeal { ... }  // Use Meal from generated types instead!

// ✅ CORRECT - For JSONB data not in schema
interface GroceryItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  is_purchased: boolean;
}
```

## Common Error Patterns and Fixes

### Biome Error Fixes:
- **`noExplicitAny`**: Replace with proper Supabase generated types from `@/types`
- **`noArrayIndexKey`**: Use stable IDs (crypto.randomUUID()) or content-based keys
- **`useExhaustiveDependencies`**: Fix React hook dependency arrays
- **`noSvgWithoutTitle`**: Add `<title>` and `aria-label` to SVG elements

### TypeScript Error Fixes:
- **Module not found**: Check path aliases in tsconfig.json, verify file locations
- **Implicit `any`**: Add explicit types to all function parameters
- **Null safety**: Add null checks or optional chaining before using values
- **Zod `.errors`**: Change to `.issues` (correct Zod API)
- **Type mismatches**: Import proper library types, use Supabase generated types

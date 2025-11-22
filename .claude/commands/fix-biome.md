---
description: Fix all Biome linting and formatting errors
---

Run Biome with auto-fix to resolve all linting and formatting issues in the codebase.

Please execute:
```bash
pnpm run lint:fix
```

This will:
- Automatically fix all auto-fixable linting errors
- Format all code according to Biome configuration
- Apply import sorting
- Report any errors that require manual fixes

**Then check for TypeScript errors:**
```bash
pnpm tsc --noEmit
```

This will:
- Verify all TypeScript types are correct
- Catch type errors that Biome might miss
- Ensure proper usage of Supabase generated types
- Check for module resolution issues

After running both commands, please summarize:
1. Number of files fixed by Biome
2. Any TypeScript compilation errors found
3. Any remaining Biome errors that need manual intervention
4. Suggestions for resolving manual fixes if needed

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

## If Auto-Fix Doesn't Work

If there are errors that cannot be auto-fixed:

1. **Use Serena MCP** to locate and analyze the specific error locations:
   - Use `mcp__serena__search_for_pattern` to find problematic code patterns
   - Use `mcp__serena__get_symbols_overview` to understand file structure
   - Use `mcp__serena__find_symbol` to read specific functions/classes with errors

2. **Use Context7 MCP** to find solutions:
   - Search Biome documentation: `mcp__context7__resolve-library-id` for "biomejs"
   - Get specific rule documentation: `mcp__context7__get-library-docs` with the error code
   - Find best practices and examples for fixing the specific error type

3. **Apply Fixes Systematically**:
   - **For `noExplicitAny` errors**: Replace with proper Supabase generated types
   - **For `noArrayIndexKey` errors**: Use stable IDs or content-based keys
   - **For `useExhaustiveDependencies` warnings**: Fix dependency arrays properly
   - Use `mcp__serena__replace_symbol_body` for targeted symbol fixes
   - Use the Edit tool for precise line-by-line corrections
   - Ensure fixes follow Biome configuration in biome.json

4. **Verify Fixes**:
   - Run `pnpm run lint:fix` again to confirm all errors are resolved
   - Run `pnpm run type-check` to ensure TypeScript compilation still works

# Commit

Create focused git commits following conventional commit format without co-author attribution.

## Process

1. **Analyze all changed files** and group them by logical purpose
2. **Create separate small commits** for different concerns:
   - Features (`feat:`)
   - Bug fixes (`fix:`)
   - Refactoring (`refactor:`)
   - Tests (`test:`)
   - Styles (`style:`)
   - Documentation (`docs:`)

3. **For each commit group:**
   - Stage only related files
   - Write clear, concise commit message
   - Commit immediately
   - **Do NOT include co-author attribution**

## Commit Message Format

```
type: brief description

[optional body if needed]
```

## Examples

- `fix: resolve bookmark button flickering`
- `refactor: simplify useToggleProjectFavorite hook`
- `test: add comprehensive hook tests`

**Important**: Make multiple small, focused commits rather than one large commit. Each commit should represent one logical change.

# PrepGenie

**AI-Powered Meal Prep & Nutrition Planner**

PrepGenie helps users generate personalized meal plans, track macronutrients, create automated grocery lists, and get AI nutrition assistance.

## Features

- **User Profile & Onboarding** - Personalized fitness/health goal setup with TDEE & macro calculations
- **AI Meal Generator** - Generate meals based on dietary preferences and nutritional goals
- **Meal Prep Mode** - Weekly meal planning with prep schedules
- **Grocery List Generator** - Automated shopping lists with smart categorization
- **Meal Library** - Save and organize favorite meals
- **AI Nutrition Assistant** - ChatGPT-powered nutrition guidance
- **Recipe Nutrition Analyzer** - Analyze recipes and get improvement suggestions
- **Meal Swap System** - AI-powered meal replacements (budget/speed/dietary/macro swaps)
- **Cultural Meal Modes** - Japanese, Korean, Mediterranean, Western, Halal cuisines
- **Internationalization** - i18n infrastructure ready
- **Settings Page** - User preferences and profile management

## Tech Stack

- **Framework**: Next.js 16 RC with React 19 (Server Components, Server Actions)
- **Language**: TypeScript 5.9.2+
- **State Management**: TanStack Query (server) + Zustand (client) + nuqs (URL)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **AI**: OpenAI GPT-5-nano
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Forms**: react-hook-form + Zod validation
- **Testing**: Vitest + Playwright
- **Code Quality**: Biome (linting + formatting)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- Supabase account

### Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### Installation

```bash
# Install dependencies
pnpm install

# Generate Supabase types
pnpm supabase:types

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome linting |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm type-check` | Run TypeScript checks |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm supabase:types` | Regenerate database types |

## Project Structure

```
app/
├── (auth)/              # Login, register, onboarding
├── (app)/               # Dashboard, meals, meal-plans, grocery-lists, settings
└── api/webhooks/        # API route handlers

components/
├── atoms/ui/            # shadcn/ui components
├── molecules/           # Meal cards, macro displays
├── organisms/           # Complex features
├── templates/           # Layouts
└── providers/           # Query, store, theme providers

features/
├── meals/               # Meal management
├── meal-plans/          # Meal planning
├── recipes/             # Recipe analysis
├── grocery-lists/       # Grocery management
├── nutrition/           # TDEE, macros calculations
├── ai-chat/             # AI assistant
├── settings/            # User settings
├── progress/            # Progress tracking
└── auth/                # Authentication

lib/
├── ai/                  # OpenAI client
├── supabase/            # Supabase clients
└── utils/               # Helpers, constants

types/
├── database.ts          # Auto-generated Supabase types
└── index.ts             # Type exports
```

## Testing

The project uses **Vitest** for unit/integration tests and **Playwright** for E2E tests.

### Test Structure

```
tests/
├── mocks/               # Shared mocks (Supabase, etc.)
├── helpers/             # Test utilities and mock data
├── unit/                # Unit tests
│   ├── components/      # Component tests (molecules)
│   ├── features/        # Feature logic tests
│   │   ├── meal-plans/  # Schema, meal-matcher tests
│   │   ├── meals/       # Meal schema tests
│   │   ├── grocery-lists/
│   │   ├── nutrition/   # TDEE, macros calculations
│   │   └── user-profile/
│   ├── stores/          # Zustand store tests
│   └── lib/             # Utility tests (i18n, etc.)
├── integration/         # Integration tests
│   └── features/        # Server Action tests
│       ├── auth/
│       ├── meals/
│       ├── meal-plans/
│       ├── recipes/
│       └── settings/
├── e2e/                 # End-to-end tests (Playwright)
│   ├── models/          # Page Object Models
│   ├── auth.setup.ts    # Authentication setup
│   ├── meal-plan.spec.ts
│   ├── meal-swap.spec.ts
│   ├── grocery-list.spec.ts
│   ├── instant-meal-plan.spec.ts
│   └── recipe-analyzer.spec.ts
└── setup.ts             # Test setup configuration

playwright/
└── .auth/               # Authenticated session storage
```

### Running Tests

```bash
# Run all unit & integration tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e --ui

# Run specific test file
pnpm test tests/unit/features/nutrition/tdee.test.ts
```

## License

MIT

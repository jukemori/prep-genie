/**
 * Test user credentials and data for E2E tests
 * Following Playwright best practices for test isolation
 */

export const TEST_USERS = {
  newUser: {
    email: `test-${Date.now()}@prepgenie.com`,
    password: 'Test123456!',
    profile: {
      age: 28,
      weight: 70,
      height: 175,
      gender: 'male' as const,
      activityLevel: 'moderate' as const,
      goal: 'muscle_gain' as const,
      dietaryPreference: 'omnivore' as const,
      allergies: [] as string[],
      cookingSkillLevel: 'intermediate' as const,
      timeAvailable: 60,
      budgetLevel: 'medium' as const,
    },
  },
  existingUser: {
    email: 'existing-user@prepgenie.com',
    password: 'ExistingUser123!',
  },
  japaneseUser: {
    email: `jp-test-${Date.now()}@prepgenie.com`,
    password: 'Japanese123!',
    profile: {
      age: 35,
      weight: 65,
      height: 168,
      gender: 'female' as const,
      activityLevel: 'light' as const,
      goal: 'weight_loss' as const,
      dietaryPreference: 'pescatarian' as const,
      allergies: ['gluten'],
      cookingSkillLevel: 'advanced' as const,
      timeAvailable: 90,
      budgetLevel: 'high' as const,
      locale: 'ja',
    },
  },
}

export function generateUniqueEmail(): string {
  return `e2e-test-${Date.now()}-${Math.random().toString(36).substring(7)}@prepgenie.com`
}

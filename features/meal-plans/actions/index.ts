// Re-export all meal plan actions from modular files
export { deleteMealPlan, getMealPlan, getMealPlans } from './crud'
export { generateAIMealPlan, generateInstantMealPlan, saveMealPlan } from './generation'
export { swapMeal, toggleMealCompleted } from './meal-management'

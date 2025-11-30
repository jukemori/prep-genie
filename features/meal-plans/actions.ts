// Re-export all meal plan actions for backwards compatibility
// Actions are now split into modular files in ./actions/

export {
  deleteMealPlan,
  generateAIMealPlan,
  generateInstantMealPlan,
  getMealPlan,
  getMealPlans,
  saveMealPlan,
  swapMeal,
  toggleMealCompleted,
} from './actions/index'

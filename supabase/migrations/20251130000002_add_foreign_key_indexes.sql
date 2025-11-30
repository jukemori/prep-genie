-- Migration: Add indexes for foreign keys to improve JOIN performance

-- meal_plan_items foreign keys
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_meal_plan_id
  ON meal_plan_items(meal_plan_id);

CREATE INDEX IF NOT EXISTS idx_meal_plan_items_meal_id
  ON meal_plan_items(meal_id);

-- grocery_lists foreign key
CREATE INDEX IF NOT EXISTS idx_grocery_lists_meal_plan_id
  ON grocery_lists(meal_plan_id);

-- saved_meals foreign keys
CREATE INDEX IF NOT EXISTS idx_saved_meals_meal_id
  ON saved_meals(meal_id);

CREATE INDEX IF NOT EXISTS idx_saved_meals_user_id
  ON saved_meals(user_id);

-- progress_logs foreign key
CREATE INDEX IF NOT EXISTS idx_progress_logs_user_id
  ON progress_logs(user_id);

-- meals foreign key (for user lookups)
CREATE INDEX IF NOT EXISTS idx_meals_user_id
  ON meals(user_id);

-- meal_plans foreign key
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id
  ON meal_plans(user_id);

-- Migration: Optimize RLS policies for performance
-- Replace auth.uid() with (select auth.uid()) to cache the result per query

-- ============================================
-- user_profiles policies
-- ============================================
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

-- ============================================
-- meals policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own meals" ON meals;
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  USING ((select auth.uid()) = user_id OR is_public = TRUE);

DROP POLICY IF EXISTS "Users can create meals" ON meals;
CREATE POLICY "Users can create meals"
  ON meals FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own meals" ON meals;
CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own meals" ON meals;
CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- meal_plans policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own meal plans" ON meal_plans;
CREATE POLICY "Users can view own meal plans"
  ON meal_plans FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create meal plans" ON meal_plans;
CREATE POLICY "Users can create meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own meal plans" ON meal_plans;
CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans;
CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- meal_plan_items policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own meal plan items" ON meal_plan_items;
CREATE POLICY "Users can view own meal plan items"
  ON meal_plan_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage own meal plan items" ON meal_plan_items;
CREATE POLICY "Users can manage own meal plan items"
  ON meal_plan_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = (select auth.uid())
    )
  );

-- ============================================
-- grocery_lists policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own grocery lists" ON grocery_lists;
CREATE POLICY "Users can view own grocery lists"
  ON grocery_lists FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own grocery lists" ON grocery_lists;
CREATE POLICY "Users can manage own grocery lists"
  ON grocery_lists FOR ALL
  USING ((select auth.uid()) = user_id);

-- ============================================
-- saved_meals policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own saved meals" ON saved_meals;
CREATE POLICY "Users can view own saved meals"
  ON saved_meals FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own saved meals" ON saved_meals;
CREATE POLICY "Users can manage own saved meals"
  ON saved_meals FOR ALL
  USING ((select auth.uid()) = user_id);

-- ============================================
-- progress_logs policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own progress logs" ON progress_logs;
CREATE POLICY "Users can view own progress logs"
  ON progress_logs FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own progress logs" ON progress_logs;
CREATE POLICY "Users can manage own progress logs"
  ON progress_logs FOR ALL
  USING ((select auth.uid()) = user_id);

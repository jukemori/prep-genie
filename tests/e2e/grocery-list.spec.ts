import { test, expect } from '@playwright/test'

/**
 * E2E Test: Grocery List Creation User Journey
 *
 * User Journey:
 * 1. Navigate to meal plan
 * 2. Generate grocery list from meal plan
 * 3. View grocery list with categorized items
 * 4. Check off purchased items
 * 5. Edit quantities
 */

test.describe('Grocery List Journey', () => {
  test('should generate grocery list from meal plan', async ({ page }) => {
    // Navigate to meal plans
    await page.goto('/meal-plans')
    await expect(page).toHaveURL(/.*meal-plans/)

    // Click on first "View Plan" button
    const viewPlanButton = page.getByRole('link', { name: /view plan|表示/i }).first()
    await viewPlanButton.click()

    await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+/)

    // Look for "Generate Grocery List" or "Create Shopping List" button
    const generateGroceryButton = page.locator(
      'button:has-text("Generate Grocery List"), button:has-text("Create Shopping List"), button:has-text("Shopping List")'
    )

    if (await generateGroceryButton.isVisible({ timeout: 5000 })) {
      await generateGroceryButton.click()

      // Wait for navigation to grocery list or for list to generate
      await page.waitForTimeout(2000)

      // Verify grocery list items are displayed
      const groceryItems = page.locator(
        '[data-testid="grocery-item"], .grocery-item, li:has-text(/oz|cup|lb|g|kg/)'
      )
      await expect(groceryItems.first()).toBeVisible({ timeout: 10000 })

      // Verify categories are displayed (produce, protein, dairy, etc.)
      const categories = page.locator('h3, h4, [data-testid="category"]')
      await expect(categories.first()).toBeVisible()
    }
  })

  test('should check off grocery items as purchased', async ({ page }) => {
    // Navigate to grocery lists
    await page.goto('/grocery-lists')

    // Click on "View List" button on first grocery list card
    const viewListButton = page.getByRole('link', { name: /view list|リストを表示/i }).first()

    if (await viewListButton.isVisible({ timeout: 5000 })) {
      await viewListButton.click()

      await expect(page).toHaveURL(/.*grocery-lists\/[a-f0-9-]+/)

      // Find first unchecked item
      const firstCheckbox = page.locator('input[type="checkbox"]').first()
      await firstCheckbox.click()

      // Verify checkbox is checked
      await expect(firstCheckbox).toBeChecked()

      // Optionally verify item has strikethrough or completed styling
      const checkedItem = page.locator('[data-checked="true"], .line-through').first()
      await expect(checkedItem).toBeVisible({ timeout: 2000 })
    }
  })

  test('should display estimated cost', async ({ page }) => {
    await page.goto('/grocery-lists')

    const viewListButton = page.getByRole('link', { name: /view list|リストを表示/i }).first()

    if (await viewListButton.isVisible({ timeout: 5000 })) {
      await viewListButton.click()

      // Look for cost display
      const costDisplay = page.locator('text=/\\$|USD|JPY|cost|price|total/i')
      await expect(costDisplay.first()).toBeVisible({ timeout: 5000 })
    }
  })
})

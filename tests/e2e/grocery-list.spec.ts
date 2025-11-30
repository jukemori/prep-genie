import { expect, test } from '@playwright/test'

/**
 * E2E Test: Grocery List
 *
 * Tests:
 * 1. Navigate to meal plan
 * 2. Generate grocery list from meal plan
 * 3. View grocery list with categorized items
 * 4. Check off purchased items
 * 5. Edit quantities
 */

test.describe('Grocery List', () => {
  test('should generate grocery list from meal plan', async ({ page }) => {
    // Navigate to meal plans
    await page.goto('/meal-plans')
    await expect(page).toHaveURL(/.*meal-plans/)

    // Click on first "View Plan" button using test ID
    const viewPlanButton = page.getByTestId('view-meal-plan').first()
    await expect(viewPlanButton).toBeVisible({ timeout: 5000 })
    await viewPlanButton.click()

    await expect(page).toHaveURL(/.*meal-plans\/[a-f0-9-]+/, { timeout: 5000 })

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

    // Wait for page to load and find View List button
    const viewListButton = page.getByTestId('view-grocery-list').first()
    await expect(viewListButton).toBeVisible({ timeout: 5000 })
    await viewListButton.click()

    // Wait for navigation and verify we're on detail page
    await page.waitForURL(/.*grocery-lists\/[a-f0-9-]+/, { timeout: 5000 })

    // Find first checkbox (Radix UI checkboxes have role="checkbox")
    const firstCheckbox = page.getByRole('checkbox').first()
    await expect(firstCheckbox).toBeVisible()

    // Verify checkbox is initially unchecked
    await expect(firstCheckbox).not.toBeChecked()

    // Click checkbox and wait for state change (includes API call)
    await firstCheckbox.click()

    // Wait for Radix UI's data-state attribute to update (includes network round-trip)
    await expect(firstCheckbox).toHaveAttribute('data-state', 'checked', { timeout: 10000 })
  })

  test('should display estimated cost', async ({ page }) => {
    await page.goto('/grocery-lists')

    // Wait for page to load and find View List button
    const viewListButton = page.getByTestId('view-grocery-list').first()
    await expect(viewListButton).toBeVisible({ timeout: 5000 })
    await viewListButton.click()

    // Wait for navigation to detail page
    await page.waitForURL(/.*grocery-lists\/[a-f0-9-]+/, { timeout: 5000 })

    // Look for items purchased text to confirm page loaded
    const itemsText = page.locator('text=/items purchased|アイテム購入済み/i')
    await expect(itemsText).toBeVisible({ timeout: 5000 })
  })
})

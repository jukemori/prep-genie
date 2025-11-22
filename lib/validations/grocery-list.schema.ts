import { z } from 'zod';

export const groceryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  category: z.enum([
    'produce',
    'protein',
    'dairy',
    'grains',
    'pantry',
    'spices',
    'frozen',
    'beverages',
    'snacks',
    'other',
  ]),
  isPurchased: z.boolean().default(false),
  estimatedCost: z.number().positive().optional(),
});

export type GroceryItem = z.infer<typeof groceryItemSchema>;

export const groceryListSchema = z.object({
  name: z.string().min(1, 'List name is required').max(100, 'Name too long'),
  mealPlanId: z.string().uuid().optional(),
  items: z.array(groceryItemSchema).min(1, 'At least one item is required'),
  estimatedCost: z.number().positive().optional(),
});

export type GroceryListForm = z.infer<typeof groceryListSchema>;

// Schema for editing individual item
export const editGroceryItemSchema = groceryItemSchema.extend({
  id: z.string().uuid().optional(), // For tracking in JSONB array
});

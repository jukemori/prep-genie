export const CUISINE_GUIDELINES = {
  japanese: {
    name: 'Japanese',
    description: 'Authentic Japanese cuisine with traditional ingredients and cooking methods',
    principles: [
      'Emphasize umami flavor (dashi, miso, soy sauce)',
      'Balance of protein, rice, and vegetables',
      'Minimal use of oil, focus on steaming, grilling, simmering',
      'Seasonal ingredients (shun)',
      'Visual presentation and color balance',
    ],
    commonIngredients: [
      'Rice (white, brown, sushi rice)',
      'Dashi (kombu, bonito)',
      'Miso paste (white, red)',
      'Soy sauce, mirin, sake',
      'Tofu, natto, edamame',
      'Seaweed (nori, wakame)',
      'Fish (salmon, mackerel, tuna)',
      'Daikon, shiitake mushrooms',
      'Ginger, wasabi, sesame',
    ],
    cookingMethods: [
      'Steaming (mushimono)',
      'Grilling (yakimono)',
      'Simmering (nimono)',
      'Deep-frying (agemono) - tempura, karaage',
      'Pickling (tsukemono)',
    ],
    mealStructure: 'Ichiju-sansai (one soup, three dishes) with rice as staple',
    measurements: '200mL cups for rice measurements',
  },

  korean: {
    name: 'Korean',
    description: 'Traditional Korean cuisine with fermented foods and bold flavors',
    principles: [
      'Banchan (side dishes) culture',
      'Fermented foods for gut health',
      'Balance of spicy, sweet, sour, and salty',
      'Communal dining style',
      'Red pepper (gochugaru) as key flavor',
    ],
    commonIngredients: [
      'Rice (white, mixed grains)',
      'Kimchi (napa cabbage, radish)',
      'Gochujang, gochugaru (red pepper)',
      'Doenjang (fermented soybean paste)',
      'Sesame oil, sesame seeds',
      'Garlic, ginger, green onions',
      'Korean pear, apple for marinades',
      'Beef (bulgogi cuts), pork belly',
      'Tofu, glass noodles (dangmyeon)',
    ],
    cookingMethods: [
      'Grilling (gui) - bulgogi, galbi',
      'Stir-frying (bokkeum)',
      'Stewing (jjigae, jeongol)',
      'Steaming (jjim)',
      'Fermenting (kimchi, doenjang)',
    ],
    mealStructure: 'Rice, soup, and multiple banchan served together',
    measurements: 'Standard metric measurements',
  },

  mediterranean: {
    name: 'Mediterranean',
    description: 'Heart-healthy Mediterranean diet with olive oil and fresh produce',
    principles: [
      'Olive oil as primary fat',
      'Abundant vegetables and fruits',
      'Whole grains and legumes',
      'Fish and seafood over red meat',
      'Moderate dairy (yogurt, cheese)',
      'Herbs and spices over salt',
    ],
    commonIngredients: [
      'Extra virgin olive oil',
      'Tomatoes, eggplant, zucchini',
      'Chickpeas, lentils, white beans',
      'Whole grains (farro, bulgur, quinoa)',
      'Fish (salmon, sardines, sea bass)',
      'Greek yogurt, feta cheese',
      'Olives, capers',
      'Garlic, oregano, basil, parsley',
      'Lemon, tahini',
    ],
    cookingMethods: [
      'Grilling and roasting',
      'Sautéing in olive oil',
      'Braising (slow-cooked stews)',
      'Fresh salads and mezze',
      'Baking (bread, pita)',
    ],
    mealStructure: 'Multiple small dishes (mezze), main protein, salad, bread',
    measurements: 'Standard US/metric cups and measurements',
  },

  western: {
    name: 'Western',
    description: 'American and European classics with modern adaptations',
    principles: [
      'Protein-centric meals',
      'Variety of cooking techniques',
      'Comfort food adaptations',
      'Balanced plate method',
      'Seasonal produce incorporation',
    ],
    commonIngredients: [
      'Beef, chicken, pork',
      'Potatoes, pasta, rice',
      'Mixed greens, broccoli, carrots',
      'Butter, cream, cheese',
      'Onions, garlic, herbs',
      'Tomato sauce, stock',
      'Whole grain bread',
      'Eggs, milk',
    ],
    cookingMethods: [
      'Roasting and baking',
      'Pan-frying and sautéing',
      'Grilling and barbecuing',
      'Slow cooking and braising',
      'Steaming vegetables',
    ],
    mealStructure: 'Protein, starch, and vegetable on one plate',
    measurements: '240mL US cups',
  },

  halal: {
    name: 'Halal',
    description: 'Islamic dietary guidelines with halal-certified ingredients',
    principles: [
      'All meat must be halal-certified',
      'No pork or pork-derived products',
      'No alcohol in cooking',
      'Zabihah (Islamic slaughter) for meat',
      'Clean and wholesome ingredients',
    ],
    commonIngredients: [
      'Halal-certified chicken, lamb, beef',
      'Fish and seafood',
      'Rice, couscous, flatbreads',
      'Lentils, chickpeas',
      'Dates, figs, pomegranate',
      'Olive oil, tahini',
      'Cumin, coriander, turmeric, saffron',
      'Yogurt (halal-certified)',
      'Nuts (almonds, pistachios)',
    ],
    cookingMethods: [
      'Grilling (kebabs, shawarma)',
      'Stewing (tagines, curries)',
      'Rice pilaf preparation',
      'Baking (bread, pastries)',
      'Slow-cooking (biriyani)',
    ],
    mealStructure: 'Varies by region (Middle Eastern, South Asian, etc.)',
    measurements: 'Metric measurements preferred',
    specialNotes: [
      'Verify all packaged ingredients are halal-certified',
      'No wine, beer, or alcohol-based ingredients',
      'Gelatin must be from halal sources',
      'Check vanilla extract (often contains alcohol)',
    ],
  },
} as const

export type CuisineType = keyof typeof CUISINE_GUIDELINES

export function getCuisineGuidance(cuisineType: CuisineType): string {
  const guide = CUISINE_GUIDELINES[cuisineType]
  const specialNotesSection =
    'specialNotes' in guide
      ? `\n**Special Notes:**\n${guide.specialNotes.map((n: string) => `- ${n}`).join('\n')}`
      : ''

  return `
**${guide.name} Cuisine Guidelines:**

${guide.description}

**Core Principles:**
${guide.principles.map((p) => `- ${p}`).join('\n')}

**Common Ingredients:**
${guide.commonIngredients.join(', ')}

**Typical Cooking Methods:**
${guide.cookingMethods.map((m) => `- ${m}`).join('\n')}

**Meal Structure:** ${guide.mealStructure}

**Measurements:** ${guide.measurements}
${specialNotesSection}
`
}

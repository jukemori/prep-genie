/**
 * Allergen Detection Utility
 * Auto-generates allergen tags from ingredient names
 */

// Common allergen ingredients mapping
const ALLERGEN_INGREDIENTS: Record<string, string[]> = {
  dairy: [
    'milk',
    'cheese',
    'butter',
    'cream',
    'yogurt',
    'whey',
    'ghee',
    'paneer',
    'ricotta',
    'mozzarella',
    'parmesan',
    'feta',
    'cheddar',
    'goat cheese',
    'cream cheese',
    'sour cream',
    'heavy cream',
    'half and half',
    'buttermilk',
    'condensed milk',
    'evaporated milk',
    'ice cream',
    'custard',
    'ミルク',
    'チーズ',
    'バター',
    'クリーム',
    'ヨーグルト',
    '牛乳',
    '生クリーム',
  ],
  gluten: [
    'flour',
    'bread',
    'pasta',
    'wheat',
    'barley',
    'rye',
    'soy sauce',
    'teriyaki',
    'udon',
    'ramen',
    'noodle',
    'tortilla',
    'pita',
    'couscous',
    'bulgur',
    'seitan',
    'breadcrumb',
    'crouton',
    'panko',
    '小麦粉',
    'パン',
    'パスタ',
    'うどん',
    'ラーメン',
    '醤油',
    'しょうゆ',
    'パン粉',
  ],
  nuts: [
    'almond',
    'walnut',
    'cashew',
    'peanut',
    'pistachio',
    'hazelnut',
    'pecan',
    'macadamia',
    'pine nut',
    'brazil nut',
    'chestnut',
    'アーモンド',
    'くるみ',
    'カシューナッツ',
    'ピーナッツ',
    'ピスタチオ',
    '落花生',
  ],
  eggs: [
    'egg',
    'eggs',
    'mayonnaise',
    'mayo',
    'meringue',
    'custard',
    'aioli',
    '卵',
    'たまご',
    'マヨネーズ',
  ],
  shellfish: [
    'shrimp',
    'prawn',
    'crab',
    'lobster',
    'clam',
    'mussel',
    'oyster',
    'scallop',
    'crawfish',
    'crayfish',
    'squid',
    'calamari',
    'octopus',
    'エビ',
    '海老',
    'カニ',
    '蟹',
    'ホタテ',
    'イカ',
    'タコ',
    'あさり',
    'しじみ',
  ],
  soy: [
    'soy',
    'tofu',
    'edamame',
    'miso',
    'tempeh',
    'soy sauce',
    'soy milk',
    'soybean',
    '豆腐',
    '味噌',
    'みそ',
    'テンペ',
    '枝豆',
    '大豆',
    '醤油',
  ],
  fish: [
    'salmon',
    'tuna',
    'cod',
    'fish sauce',
    'anchovy',
    'dashi',
    'sardine',
    'mackerel',
    'tilapia',
    'trout',
    'halibut',
    'bass',
    'snapper',
    'bonito',
    'katsuobushi',
    'サーモン',
    'マグロ',
    '鮭',
    'サバ',
    '鯖',
    'かつお',
    '鰹',
    'だし',
    '出汁',
    '魚',
  ],
  sesame: ['sesame', 'tahini', 'sesame oil', 'sesame seed', 'ごま', 'ゴマ', '胡麻', 'タヒニ'],
}

interface Ingredient {
  name: string
  quantity: number
  unit: string
  category: string
}

/**
 * Detect allergens from a list of ingredients
 * Returns array of allergen tags like ['contains_dairy', 'contains_gluten']
 */
export function detectAllergens(ingredients: Ingredient[]): string[] {
  const allergens: Set<string> = new Set()

  for (const ing of ingredients) {
    const name = ing.name.toLowerCase()
    for (const [allergen, keywords] of Object.entries(ALLERGEN_INGREDIENTS)) {
      if (keywords.some((kw) => name.includes(kw.toLowerCase()))) {
        allergens.add(`contains_${allergen}`)
      }
    }
  }

  return Array.from(allergens)
}

/**
 * Check if a meal is free of a specific allergen
 */
export function isAllergenFree(ingredients: Ingredient[], allergen: string): boolean {
  const detected = detectAllergens(ingredients)
  return !detected.includes(`contains_${allergen}`)
}

/**
 * Get all allergen-free tags for a meal
 * Returns tags like ['dairy_free', 'gluten_free'] if no dairy/gluten detected
 */
export function getAllergenFreeTags(ingredients: Ingredient[]): string[] {
  const detected = detectAllergens(ingredients)
  const freeTags: string[] = []

  const allergenTypes = Object.keys(ALLERGEN_INGREDIENTS)
  for (const allergen of allergenTypes) {
    if (!detected.includes(`contains_${allergen}`)) {
      freeTags.push(`${allergen}_free`)
    }
  }

  return freeTags
}

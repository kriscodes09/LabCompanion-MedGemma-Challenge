// lib/agents/evidence/food-patterns.ts
import { getMedGemmaContent } from '../context/loader';

export interface FoodPattern {
  markerName: string;
  usda2020Summary: string;
  myPlateGroups: MyPlateGroup[];
  specificFoods: string[];
  source: 'medgemma_offline' | 'fallback';
}

export interface MyPlateGroup {
  name: 'Fruits' | 'Vegetables' | 'Grains' | 'Protein Foods' | 'Dairy';
  examples: string[];
  relevance: string;
}

export function getFoodPatterns(markerName: string): FoodPattern {
  const ctx = getMedGemmaContent(markerName);

  const source: 'medgemma_offline' | 'fallback' =
    ctx.generatedBy === 'Fallback' ? 'fallback' : 'medgemma_offline';

  const text = (ctx.foodPatterns ?? '').trim();
  if (!text) return getDefaultFoodPattern(markerName, source);

  const myPlateGroups = extractMyPlateGroups(text);
  const specificFoods = extractSpecificFoods(text);

  return {
    markerName,
    usda2020Summary: text,
    myPlateGroups,
    specificFoods,
    source,
  };
}

function extractMyPlateGroups(text: string): MyPlateGroup[] {
  const groups: MyPlateGroup[] = [];

  const proteinMatch = text.match(/Protein Foods[^.]*\(([^)]+)\)/i);
  if (proteinMatch) {
    groups.push({
      name: 'Protein Foods',
      examples: proteinMatch[1].split(',').map((s) => s.trim()).filter(Boolean),
      relevance: 'Contains nutrients relevant to this marker',
    });
  }

  const vegMatch = text.match(/Vegetables[^.]*\(([^)]+)\)/i);
  if (vegMatch) {
    groups.push({
      name: 'Vegetables',
      examples: vegMatch[1].split(',').map((s) => s.trim()).filter(Boolean),
      relevance: 'Provides vitamins and minerals',
    });
  }

  const fruitMatch = text.match(/Fruits[^.]*\(([^)]+)\)/i);
  if (fruitMatch) {
    groups.push({
      name: 'Fruits',
      examples: fruitMatch[1].split(',').map((s) => s.trim()).filter(Boolean),
      relevance: 'Rich in vitamins and antioxidants',
    });
  }

  const grainMatch = text.match(/Grains[^.]*\(([^)]+)\)/i);
  if (grainMatch) {
    groups.push({
      name: 'Grains',
      examples: grainMatch[1].split(',').map((s) => s.trim()).filter(Boolean),
      relevance: 'Provides fiber and energy',
    });
  }

  const dairyMatch = text.match(/Dairy[^.]*\(([^)]+)\)/i);
  if (dairyMatch) {
    groups.push({
      name: 'Dairy',
      examples: dairyMatch[1].split(',').map((s) => s.trim()).filter(Boolean),
      relevance: 'Source of calcium and protein',
    });
  }

  return groups;
}

function extractSpecificFoods(text: string): string[] {
  const foods: string[] = [];

  const foodKeywords = [
    'fish', 'salmon', 'meat', 'beans', 'nuts', 'eggs',
    'spinach', 'broccoli', 'kale', 'carrots', 'peppers',
    'berries', 'apples', 'oranges', 'bananas',
    'oats', 'rice', 'bread', 'quinoa', 'whole grains',
    'milk', 'yogurt', 'cheese',
  ];

  const lowerText = text.toLowerCase();

  foodKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      foods.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });

  return [...new Set(foods)];
}

function getDefaultFoodPattern(markerName: string, source: 'medgemma_offline' | 'fallback'): FoodPattern {
  return {
    markerName,
    source, // usually fallback, but could be medgemma_offline with missing foodPatterns
    usda2020Summary:
      'A balanced diet following USDA 2020 Dietary Guidelines emphasizes variety across all food groups.',
    myPlateGroups: [
      {
        name: 'Fruits',
        examples: ['Berries', 'Apples', 'Bananas'],
        relevance: 'Provides vitamins and fiber',
      },
      {
        name: 'Vegetables',
        examples: ['Leafy greens', 'Broccoli', 'Carrots'],
        relevance: 'Rich in nutrients and minerals',
      },
      {
        name: 'Grains',
        examples: ['Whole wheat', 'Brown rice', 'Oats'],
        relevance: 'Source of energy and fiber',
      },
      {
        name: 'Protein Foods',
        examples: ['Lean meats', 'Fish', 'Beans'],
        relevance: 'Essential for body function',
      },
      {
        name: 'Dairy',
        examples: ['Milk', 'Yogurt', 'Cheese'],
        relevance: 'Calcium and protein source',
      },
    ],
    specificFoods: [],
  };
}

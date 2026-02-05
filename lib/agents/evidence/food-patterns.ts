import { getMedGemmaContent } from '../context/loader';

export interface FoodPattern {
  markerName: string;
  usda2020Summary: string;
  myPlateGroups: MyPlateGroup[];
  specificFoods: string[];
}

export interface MyPlateGroup {
  name: 'Fruits' | 'Vegetables' | 'Grains' | 'Protein Foods' | 'Dairy';
  examples: string[];
  relevance: string;
}

export function getFoodPatterns(markerName: string): FoodPattern {
  try {
    const content = getMedGemmaContent(markerName);
    
    if (!content.foodPatterns) {
      return getDefaultFoodPattern(markerName);
    }
    
    // Parse MyPlate groups from MedGemma content
    const myPlateGroups = extractMyPlateGroups(content.foodPatterns);
    const specificFoods = extractSpecificFoods(content.foodPatterns);
    
    return {
      markerName,
      usda2020Summary: content.foodPatterns,
      myPlateGroups,
      specificFoods
    };
    
  } catch (error) {
    console.error(`Error getting food patterns for ${markerName}:`, error);
    return getDefaultFoodPattern(markerName);
  }
}

function extractMyPlateGroups(text: string): MyPlateGroup[] {
  const groups: MyPlateGroup[] = [];
  
  // Extract Protein Foods
  const proteinMatch = text.match(/Protein Foods[^.]*\(([^)]+)\)/i);
  if (proteinMatch) {
    groups.push({
      name: 'Protein Foods',
      examples: proteinMatch[1].split(',').map(s => s.trim()),
      relevance: 'Contains nutrients relevant to this marker'
    });
  }
  
  // Extract Vegetables
  const vegMatch = text.match(/Vegetables[^.]*\(([^)]+)\)/i);
  if (vegMatch) {
    groups.push({
      name: 'Vegetables',
      examples: vegMatch[1].split(',').map(s => s.trim()),
      relevance: 'Provides vitamins and minerals'
    });
  }
  
  // Extract Fruits
  const fruitMatch = text.match(/Fruits[^.]*\(([^)]+)\)/i);
  if (fruitMatch) {
    groups.push({
      name: 'Fruits',
      examples: fruitMatch[1].split(',').map(s => s.trim()),
      relevance: 'Rich in vitamins and antioxidants'
    });
  }
  
  // Extract Grains
  const grainMatch = text.match(/Grains[^.]*\(([^)]+)\)/i);
  if (grainMatch) {
    groups.push({
      name: 'Grains',
      examples: grainMatch[1].split(',').map(s => s.trim()),
      relevance: 'Provides fiber and energy'
    });
  }
  
  // Extract Dairy
  const dairyMatch = text.match(/Dairy[^.]*\(([^)]+)\)/i);
  if (dairyMatch) {
    groups.push({
      name: 'Dairy',
      examples: dairyMatch[1].split(',').map(s => s.trim()),
      relevance: 'Source of calcium and protein'
    });
  }
  
  return groups;
}

function extractSpecificFoods(text: string): string[] {
  const foods: string[] = [];
  
  // Common food keywords
  const foodKeywords = [
    'fish', 'salmon', 'meat', 'beans', 'nuts', 'eggs',
    'spinach', 'broccoli', 'kale', 'carrots', 'peppers',
    'berries', 'apples', 'oranges', 'bananas',
    'oats', 'rice', 'bread', 'quinoa', 'whole grains',
    'milk', 'yogurt', 'cheese'
  ];
  
  const lowerText = text.toLowerCase();
  
  foodKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      foods.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  
  return [...new Set(foods)]; // Remove duplicates
}

function getDefaultFoodPattern(markerName: string): FoodPattern {
  return {
    markerName,
    usda2020Summary: 'A balanced diet following USDA 2020 Dietary Guidelines emphasizes variety across all food groups.',
    myPlateGroups: [
      {
        name: 'Fruits',
        examples: ['Berries', 'Apples', 'Bananas'],
        relevance: 'Provides vitamins and fiber'
      },
      {
        name: 'Vegetables',
        examples: ['Leafy greens', 'Broccoli', 'Carrots'],
        relevance: 'Rich in nutrients and minerals'
      },
      {
        name: 'Grains',
        examples: ['Whole wheat', 'Brown rice', 'Oats'],
        relevance: 'Source of energy and fiber'
      },
      {
        name: 'Protein Foods',
        examples: ['Lean meats', 'Fish', 'Beans'],
        relevance: 'Essential for body function'
      },
      {
        name: 'Dairy',
        examples: ['Milk', 'Yogurt', 'Cheese'],
        relevance: 'Calcium and protein source'
      }
    ],
    specificFoods: []
  };
}
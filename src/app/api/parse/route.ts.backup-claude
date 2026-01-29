import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Spoonacular ingredient image base URL
const SPOONACULAR_IMG_BASE = 'https://img.spoonacular.com/ingredients_100x100';

// Map of common ingredients to their Spoonacular image names
const INGREDIENT_IMAGES: Record<string, string> = {
  // Produce
  'onion': 'brown-onion.png',
  'onions': 'brown-onion.png',
  'yellow onion': 'brown-onion.png',
  'red onion': 'red-onion.png',
  'garlic': 'garlic.png',
  'tomato': 'tomato.png',
  'tomatoes': 'tomato.png',
  'cherry tomatoes': 'cherry-tomatoes.png',
  'avocado': 'avocado.jpg',
  'avocados': 'avocado.jpg',
  'cilantro': 'cilantro.png',
  'lime': 'lime.jpg',
  'limes': 'lime.jpg',
  'lemon': 'lemon.png',
  'lemons': 'lemon.png',
  'lettuce': 'iceberg-lettuce.jpg',
  'romaine': 'romaine.jpg',
  'carrot': 'sliced-carrot.png',
  'carrots': 'sliced-carrot.png',
  'celery': 'celery.jpg',
  'potato': 'potatoes-yukon-gold.png',
  'potatoes': 'potatoes-yukon-gold.png',
  'sweet potato': 'sweet-potato.png',
  'bell pepper': 'bell-pepper-orange.png',
  'red bell pepper': 'red-pepper.png',
  'green bell pepper': 'green-pepper.png',
  'jalapeño': 'jalapeno-pepper.png',
  'jalapeno': 'jalapeno-pepper.png',
  'serrano': 'serrano-pepper.png',
  'ginger': 'ginger.png',
  'spinach': 'spinach.jpg',
  'kale': 'kale.jpg',
  'broccoli': 'broccoli.jpg',
  'cauliflower': 'cauliflower.jpg',
  'mushrooms': 'mushrooms.png',
  'mushroom': 'mushrooms.png',
  'green onion': 'spring-onions.jpg',
  'green onions': 'spring-onions.jpg',
  'scallions': 'spring-onions.jpg',
  'cucumber': 'cucumber.jpg',
  'zucchini': 'zucchini.jpg',
  'asparagus': 'asparagus.png',
  'corn on the cob': 'corn-on-the-cob.jpg',
  'cabbage': 'cabbage.jpg',
  'apple': 'apple.jpg',
  'apples': 'apple.jpg',
  'banana': 'bananas.jpg',
  'bananas': 'bananas.jpg',
  'orange': 'orange.png',
  'oranges': 'orange.png',
  'strawberries': 'strawberries.png',
  'blueberries': 'blueberries.jpg',
  
  // Meat & Seafood
  'chicken': 'chicken-breasts.png',
  'chicken breast': 'chicken-breasts.png',
  'chicken breasts': 'chicken-breasts.png',
  'chicken thighs': 'chicken-thighs.png',
  'chicken thigh': 'chicken-thighs.png',
  'whole chicken': 'whole-chicken.jpg',
  'ground beef': 'fresh-ground-beef.jpg',
  'beef': 'beef-cubes-raw.png',
  'steak': 'steak.jpg',
  'pork': 'pork-tenderloin-raw.png',
  'pork chops': 'pork-chops.jpg',
  'ground pork': 'ground-pork.jpg',
  'bacon': 'raw-bacon.png',
  'sausage': 'sausage.png',
  'italian sausage': 'italian-sausage.jpg',
  'shrimp': 'shrimp.png',
  'salmon': 'salmon.png',
  'fish': 'fish-fillet.jpg',
  'cod': 'cod-fillet.jpg',
  'tilapia': 'tilapia.jpg',
  'tuna': 'tuna-steak.jpg',
  'crab': 'crab.jpg',
  'lobster': 'lobster.png',
  'ground turkey': 'ground-turkey.jpg',
  'turkey': 'turkey-breast.jpg',
  
  // Dairy
  'milk': 'milk.png',
  'whole milk': 'milk.png',
  'butter': 'butter-sliced.jpg',
  'unsalted butter': 'butter-sliced.jpg',
  'cheese': 'cheddar-cheese.png',
  'cheddar': 'cheddar-cheese.png',
  'cheddar cheese': 'cheddar-cheese.png',
  'mozzarella': 'mozzarella.png',
  'parmesan': 'parmesan.jpg',
  'feta': 'feta.png',
  'cream cheese': 'cream-cheese.jpg',
  'sour cream': 'sour-cream.jpg',
  'yogurt': 'plain-yogurt.jpg',
  'greek yogurt': 'greek-yogurt.jpg',
  'eggs': 'egg.png',
  'egg': 'egg.png',
  'heavy cream': 'fluid-cream.jpg',
  'half and half': 'milk.jpg',
  'whipping cream': 'whipped-cream.jpg',
  'cottage cheese': 'cottage-cheese.png',
  'ricotta': 'ricotta.png',
  
  // Pantry
  'flour': 'flour.png',
  'all-purpose flour': 'flour.png',
  'bread flour': 'flour.png',
  'sugar': 'sugar-in-702lear.png',
  'white sugar': 'sugar-in-702lear.png',
  'brown sugar': 'dark-brown-sugar.png',
  'powdered sugar': 'powdered-sugar.jpg',
  'rice': 'uncooked-white-rice.png',
  'white rice': 'uncooked-white-rice.png',
  'brown rice': 'brown-rice.png',
  'pasta': 'spaghetti.jpg',
  'spaghetti': 'spaghetti.jpg',
  'penne': 'penne.jpg',
  'macaroni': 'macaroni.jpg',
  'bread': 'white-bread.jpg',
  'olive oil': 'olive-oil.jpg',
  'extra virgin olive oil': 'olive-oil.jpg',
  'vegetable oil': 'vegetable-oil.jpg',
  'canola oil': 'vegetable-oil.jpg',
  'sesame oil': 'sesame-oil.jpg',
  'coconut oil': 'coconut-oil.jpg',
  'soy sauce': 'soy-sauce.jpg',
  'fish sauce': 'fish-sauce.jpg',
  'worcestershire sauce': 'worcestershire-sauce.jpg',
  'hot sauce': 'hot-sauce.jpg',
  'vinegar': 'vinegar-(white).jpg',
  'white vinegar': 'vinegar-(white).jpg',
  'apple cider vinegar': 'apple-cider-vinegar.jpg',
  'balsamic vinegar': 'balsamic-vinegar.jpg',
  'red wine vinegar': 'red-wine-vinegar.jpg',
  'honey': 'honey.png',
  'maple syrup': 'maple-syrup.png',
  'peanut butter': 'peanut-butter.png',
  'almond butter': 'almond-butter.jpg',
  'tortillas': 'flour-tortilla.jpg',
  'flour tortillas': 'flour-tortilla.jpg',
  'corn tortillas': 'corn-tortillas.png',
  'bread crumbs': 'breadcrumbs.jpg',
  'panko': 'panko.jpg',
  'chicken broth': 'chicken-broth.png',
  'chicken stock': 'chicken-broth.png',
  'beef broth': 'beef-broth.png',
  'vegetable broth': 'vegetable-broth.jpg',
  'coconut milk': 'coconut-milk.png',
  'oats': 'rolled-oats.jpg',
  'rolled oats': 'rolled-oats.jpg',
  'quinoa': 'quinoa.png',
  'lentils': 'lentils.png',
  'nuts': 'mixed-nuts.jpg',
  'almonds': 'almonds.jpg',
  'walnuts': 'walnuts.jpg',
  'pecans': 'pecans.jpg',
  'peanuts': 'peanuts.png',
  'cashews': 'cashews.jpg',
  
  // Spices
  'salt': 'salt.jpg',
  'kosher salt': 'salt.jpg',
  'sea salt': 'salt.jpg',
  'pepper': 'pepper.jpg',
  'black pepper': 'pepper.jpg',
  'white pepper': 'white-pepper.jpg',
  'cumin': 'cumin.jpg',
  'ground cumin': 'cumin.jpg',
  'paprika': 'paprika.jpg',
  'smoked paprika': 'paprika.jpg',
  'chili powder': 'chili-powder.jpg',
  'cayenne': 'cayenne.jpg',
  'cayenne pepper': 'cayenne.jpg',
  'oregano': 'oregano.jpg',
  'dried oregano': 'oregano.jpg',
  'basil': 'fresh-basil.jpg',
  'fresh basil': 'fresh-basil.jpg',
  'dried basil': 'dried-basil.jpg',
  'thyme': 'thyme.jpg',
  'fresh thyme': 'thyme.jpg',
  'rosemary': 'rosemary.jpg',
  'fresh rosemary': 'rosemary.jpg',
  'cinnamon': 'cinnamon.jpg',
  'ground cinnamon': 'cinnamon.jpg',
  'nutmeg': 'nutmeg.jpg',
  'cloves': 'cloves.jpg',
  'garlic powder': 'garlic-powder.png',
  'onion powder': 'onion-powder.jpg',
  'bay leaves': 'bay-leaves.jpg',
  'bay leaf': 'bay-leaves.jpg',
  'red pepper flakes': 'red-pepper-flakes.jpg',
  'crushed red pepper': 'red-pepper-flakes.jpg',
  'italian seasoning': 'italian-seasoning.jpg',
  'curry powder': 'curry-powder.jpg',
  'turmeric': 'turmeric.jpg',
  'garam masala': 'garam-masala.jpg',
  'coriander': 'coriander-seeds.jpg',
  'mustard': 'mustard.jpg',
  'dijon mustard': 'dijon-mustard.jpg',
  
  // Canned Goods
  'tomato sauce': 'tomato-sauce-or-pasta-sauce.jpg',
  'tomato paste': 'tomato-paste.png',
  'diced tomatoes': 'diced-tomatoes.png',
  'crushed tomatoes': 'crushed-tomatoes.png',
  'canned tomatoes': 'canned-tomatoes.png',
  'beans': 'kidney-beans.jpg',
  'black beans': 'black-beans.jpg',
  'kidney beans': 'kidney-beans.jpg',
  'pinto beans': 'pinto-beans.jpg',
  'white beans': 'white-beans.jpg',
  'cannellini beans': 'cannellini-beans.png',
  'chickpeas': 'chickpeas.png',
  'garbanzo beans': 'chickpeas.png',
  'corn': 'corn.png',
  'canned corn': 'corn-kernels.jpg',
  'canned tuna': 'canned-tuna.png',
  'coconut cream': 'coconut-cream.png',
  
  // Beverages
  'water': 'water.png',
  'wine': 'red-wine.jpg',
  'red wine': 'red-wine.jpg',
  'white wine': 'white-wine.jpg',
  'beer': 'beer.jpg',
  'coffee': 'brewed-coffee.jpg',
  'orange juice': 'orange-juice.jpg',
};

function getIngredientImage(ingredientName: string): string {
  const normalized = ingredientName.toLowerCase().trim();
  
  // Direct match
  if (INGREDIENT_IMAGES[normalized]) {
    return `${SPOONACULAR_IMG_BASE}/${INGREDIENT_IMAGES[normalized]}`;
  }
  
  // Partial match - check if key is contained in normalized or vice versa
  for (const [key, value] of Object.entries(INGREDIENT_IMAGES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return `${SPOONACULAR_IMG_BASE}/${value}`;
    }
  }
  
  // Try matching individual words
  const words = normalized.split(' ');
  for (const word of words) {
    if (word.length > 3 && INGREDIENT_IMAGES[word]) {
      return `${SPOONACULAR_IMG_BASE}/${INGREDIENT_IMAGES[word]}`;
    }
  }
  
  // Default - no image
  return '';
}

// Check if input looks like a URL
function isUrl(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('http://') || 
         trimmed.startsWith('https://') || 
         trimmed.startsWith('www.');
}

// Fetch content from a URL
async function fetchRecipeFromUrl(url: string): Promise<string> {
  try {
    // Ensure URL has protocol
    let fullUrl = url.trim();
    if (fullUrl.startsWith('www.')) {
      fullUrl = 'https://' + fullUrl;
    }
    
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Mise/1.0; +https://mise-eight.vercel.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract text content, removing scripts and styles
    // Simple extraction - Claude will handle the parsing
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit to first 8000 chars to avoid token limits
    return textContent.slice(0, 8000);
  } catch (error) {
    console.error('URL fetch error:', error);
    throw new Error('Could not fetch recipe from URL. Please try pasting the recipe text directly.');
  }
}

// Archive recipe data for analytics
function archiveRecipe(data: {
  input: string;
  inputType: 'url' | 'text';
  recipeName: string;
  ingredientCount: number;
  ingredients: string[];
  aisles: string[];
  timestamp: string;
  userAgent?: string;
  country?: string;
}) {
  // Structured log - captured by Vercel logging
  // Can be exported via Vercel CLI: vercel logs --json
  console.log(JSON.stringify({
    type: 'RECIPE_ARCHIVE',
    ...data,
  }));
}

export async function POST(request: Request) {
  const startTime = Date.now();
  
  // Extract metadata from request
  const userAgent = request.headers.get('user-agent') || undefined;
  const country = request.headers.get('x-vercel-ip-country') || undefined;
  
  try {
    const { recipeText } = await request.json();

    if (!recipeText || typeof recipeText !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a recipe.' },
        { status: 400 }
      );
    }

    // Check if it's a URL and fetch content if so
    let contentToParse = recipeText;
    let isFromUrl = false;
    
    if (isUrl(recipeText)) {
      isFromUrl = true;
      contentToParse = await fetchRecipeFromUrl(recipeText);
    }

    const prompt = `Extract ingredients from this recipe and organize them by grocery store aisle.

${isFromUrl ? 'This content was extracted from a recipe webpage. Find the recipe ingredients.' : 'RECIPE:'}
${contentToParse}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "recipeName": "Name of the recipe if found, or 'Recipe' as default",
  "ingredients": [
    {
      "name": "ingredient name (e.g., 'Yellow Onion')",
      "amount": "quantity (e.g., '2' or '1/2')",
      "unit": "unit (e.g., 'medium', 'cup', 'lb', 'cloves')",
      "aisle": "one of: Produce, Meat & Seafood, Dairy, Bakery, Pantry, Spices, Frozen, Beverages, Canned Goods, Oils & Vinegars, Other"
    }
  ]
}

RULES:
- Extract ALL ingredients mentioned in the recipe
- Use descriptive names (e.g., "Fresh Cilantro" not just "cilantro")
- Parse amounts correctly (e.g., "2-3" becomes "2-3", "a pinch" becomes "pinch")
- Choose the most appropriate aisle for each ingredient
- Combine exact duplicates if any
- Exclude plain water unless specifically measured as an ingredient
- Include salt, pepper, and basic seasonings if they have specific measurements`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Parse the JSON response
    let parsed;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json(
        { error: 'Could not parse the recipe. Try a different format?' },
        { status: 500 }
      );
    }

    // Transform into groceryList format with images
    const groceryList: Record<string, Array<{
      id: string;
      name: string;
      amount: string;
      unit: string;
      aisle: string;
      image: string;
      checked: boolean;
    }>> = {};

    for (const ingredient of parsed.ingredients) {
      const aisle = ingredient.aisle || 'Other';
      
      if (!groceryList[aisle]) {
        groceryList[aisle] = [];
      }

      groceryList[aisle].push({
        id: `${ingredient.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: ingredient.name,
        amount: String(ingredient.amount || ''),
        unit: ingredient.unit || '',
        aisle: aisle,
        image: getIngredientImage(ingredient.name),
        checked: false,
      });
    }

    // Sort aisles in a logical store-walk order
    const aisleOrder = [
      'Produce',
      'Meat & Seafood',
      'Dairy',
      'Bakery',
      'Deli',
      'Frozen',
      'Pantry',
      'Canned Goods',
      'Spices',
      'Oils & Vinegars',
      'Beverages',
      'Other',
    ];

    const sortedGroceryList: typeof groceryList = {};
    for (const aisle of aisleOrder) {
      if (groceryList[aisle]) {
        sortedGroceryList[aisle] = groceryList[aisle];
      }
    }
    // Add any remaining aisles
    for (const aisle of Object.keys(groceryList)) {
      if (!sortedGroceryList[aisle]) {
        sortedGroceryList[aisle] = groceryList[aisle];
      }
    }

    // Archive the recipe data
    const allIngredients = Object.values(sortedGroceryList).flat();
    archiveRecipe({
      input: isFromUrl ? recipeText : `[text:${recipeText.slice(0, 100)}...]`,
      inputType: isFromUrl ? 'url' : 'text',
      recipeName: parsed.recipeName || 'Recipe',
      ingredientCount: allIngredients.length,
      ingredients: allIngredients.map(i => `${i.amount} ${i.unit} ${i.name}`.trim()),
      aisles: Object.keys(sortedGroceryList),
      timestamp: new Date().toISOString(),
      userAgent,
      country,
    });

    return NextResponse.json({ 
      groceryList: sortedGroceryList,
      recipeName: parsed.recipeName || 'Recipe',
      fromUrl: isFromUrl,
    });
  } catch (error) {
    console.error('Parse error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

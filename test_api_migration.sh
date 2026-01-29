#!/bin/bash

# Test API Migration: OpenAI vs Claude Quality Comparison
echo "================================================"
echo "  MISE API MIGRATION TEST - OpenAI GPT-4o-mini"
echo "================================================"
echo ""

API_URL="http://localhost:3000/api/parse"

# Test recipes (mix of URLs and text)
declare -a TEST_RECIPES=(
  "https://www.bonappetit.com/recipe/bas-best-chocolate-chip-cookies"
  "https://www.seriouseats.com/the-best-chicken-fried-steak"
  "https://www.budgetbytes.com/sheet-pan-chicken-fajitas/"
  "Ingredients: 2 cups flour, 1 tsp salt, 1/2 cup butter, 3 eggs, 1 cup milk, 2 tbsp sugar"
  "https://minimalistbaker.com/1-bowl-vegan-banana-muffins/"
)

SUCCESS=0
FAILED=0
TOTAL=0

for RECIPE in "${TEST_RECIPES[@]}"; do
  ((TOTAL++))
  
  echo "Test $TOTAL: Testing recipe..."
  if [[ "$RECIPE" == http* ]]; then
    echo "  Type: URL"
    echo "  URL: $RECIPE"
  else
    echo "  Type: Text"
    echo "  Input: ${RECIPE:0:60}..."
  fi
  
  # Make API call
  RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"recipeText\":\"$RECIPE\"}" 2>&1)
  
  # Check for errors
  if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error')
    echo "  ❌ FAILED: $ERROR_MSG"
    echo ""
    ((FAILED++))
    continue
  fi
  
  # Parse successful response
  RECIPE_NAME=$(echo "$RESPONSE" | jq -r '.recipeName // "Unknown"' 2>/dev/null)
  INGREDIENT_COUNT=$(echo "$RESPONSE" | jq '[.groceryList[][]] | length' 2>/dev/null)
  AISLE_COUNT=$(echo "$RESPONSE" | jq '.groceryList | keys | length' 2>/dev/null)
  
  if [ -z "$INGREDIENT_COUNT" ] || [ "$INGREDIENT_COUNT" = "null" ]; then
    echo "  ❌ FAILED: Could not parse response"
    echo ""
    ((FAILED++))
    continue
  fi
  
  echo "  ✅ SUCCESS"
  echo "     Recipe: $RECIPE_NAME"
  echo "     Ingredients: $INGREDIENT_COUNT items"
  echo "     Aisles: $AISLE_COUNT"
  echo ""
  
  ((SUCCESS++))
  
  # Rate limit delay
  sleep 2
done

echo "================================================"
echo "  TEST RESULTS"
echo "================================================"
echo "Total Tests:  $TOTAL"
echo "✅ Passed:    $SUCCESS"
echo "❌ Failed:    $FAILED"
echo ""

if [ $SUCCESS -eq $TOTAL ]; then
  echo "🎉 All tests passed! Ready for production."
  exit 0
else
  echo "⚠️  Some tests failed. Review errors above."
  exit 1
fi

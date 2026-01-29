'use client';

import { useState, useEffect, useCallback } from 'react';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  aisle: string;
  image: string;
  checked: boolean;
}

interface GroceryList {
  [aisle: string]: Ingredient[];
}

interface SavedList {
  groceryList: GroceryList;
  recipeName: string;
  timestamp: number;
}

// Store search URL patterns
const STORES = [
  { name: 'Walmart', url: (q: string) => `https://www.walmart.com/search?q=${encodeURIComponent(q)}` },
  { name: 'Target', url: (q: string) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}` },
  { name: 'Kroger', url: (q: string) => `https://www.kroger.com/search?query=${encodeURIComponent(q)}` },
  { name: 'Amazon Fresh', url: (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&i=amazonfresh` },
  { name: 'Instacart', url: (q: string) => `https://www.instacart.com/store/search_v3/term?term=${encodeURIComponent(q)}` },
  { name: 'Costco', url: (q: string) => `https://www.costco.com/CatalogSearch?keyword=${encodeURIComponent(q)}` },
];

const AISLE_CONFIG: Record<string, { emoji: string; color: string }> = {
  'Produce': { emoji: '🥬', color: 'bg-green-50 border-green-200' },
  'Meat & Seafood': { emoji: '🥩', color: 'bg-red-50 border-red-200' },
  'Dairy': { emoji: '🥛', color: 'bg-blue-50 border-blue-200' },
  'Bakery': { emoji: '🍞', color: 'bg-amber-50 border-amber-200' },
  'Pantry': { emoji: '🥫', color: 'bg-orange-50 border-orange-200' },
  'Spices': { emoji: '🧂', color: 'bg-yellow-50 border-yellow-200' },
  'Frozen': { emoji: '🧊', color: 'bg-cyan-50 border-cyan-200' },
  'Beverages': { emoji: '🥤', color: 'bg-purple-50 border-purple-200' },
  'Canned Goods': { emoji: '🥫', color: 'bg-stone-100 border-stone-300' },
  'Oils & Vinegars': { emoji: '🫒', color: 'bg-lime-50 border-lime-200' },
  'Other': { emoji: '📦', color: 'bg-gray-50 border-gray-200' },
};

// Simple hash function for caching
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export default function Home() {
  const [recipeText, setRecipeText] = useState('');
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [recipeName, setRecipeName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recentLists, setRecentLists] = useState<SavedList[]>([]);
  const [copied, setCopied] = useState(false);

  // Load recent lists from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mise-recent-lists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentLists(parsed.slice(0, 5)); // Keep only last 5
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save list to localStorage
  const saveToRecent = (list: GroceryList, name: string) => {
    const newEntry: SavedList = {
      groceryList: list,
      recipeName: name,
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...recentLists.filter(r => r.recipeName !== name)].slice(0, 5);
    setRecentLists(updated);
    localStorage.setItem('mise-recent-lists', JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeText.trim()) return;

    setLoading(true);
    setError(null);
    
    const isUrl = recipeText.trim().startsWith('http') || recipeText.trim().startsWith('www.');
    setLoadingStep(isUrl ? 'Fetching recipe...' : 'Reading ingredients...');

    // Check cache first
    const cacheKey = `mise-cache-${hashString(recipeText.trim().toLowerCase())}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { groceryList: cachedList, recipeName: cachedName } = JSON.parse(cached);
        setGroceryList(cachedList);
        setRecipeName(cachedName || 'Recipe');
        setLoading(false);
        setLoadingStep('');
        return;
      } catch {
        // Cache invalid, proceed with API call
      }
    }

    try {
      if (isUrl) {
        // Add a small delay then update step
        setTimeout(() => setLoadingStep('Parsing ingredients...'), 2000);
      }
      
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeText }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setGroceryList(data.groceryList);
        setRecipeName(data.recipeName || 'Recipe');
        
        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify({
          groceryList: data.groceryList,
          recipeName: data.recipeName,
        }));
        
        // Save to recent
        saveToRecent(data.groceryList, data.recipeName || 'Recipe');
      }
    } catch {
      setError('Something went wrong. Try again?');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const toggleItem = (aisle: string, itemId: string) => {
    if (!groceryList) return;

    const updated = {
      ...groceryList,
      [aisle]: groceryList[aisle].map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    };
    setGroceryList(updated);
    
    // Update in recent lists too
    if (recipeName) {
      saveToRecent(updated, recipeName);
    }
  };

  const copyList = () => {
    if (!groceryList) return;

    const text = Object.entries(groceryList)
      .filter(([, items]) => items.length > 0)
      .map(([aisle, items]) => {
        const aisleConfig = AISLE_CONFIG[aisle] || AISLE_CONFIG['Other'];
        return `${aisleConfig.emoji} ${aisle.toUpperCase()}\n${items
          .map((item) => `${item.checked ? '✓' : '○'} ${item.amount} ${item.unit} ${item.name}`)
          .join('\n')}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareList = async () => {
    if (!groceryList) return;

    const text = `🍳 ${recipeName}\n\n` + Object.entries(groceryList)
      .filter(([, items]) => items.length > 0)
      .map(([aisle, items]) => {
        const aisleConfig = AISLE_CONFIG[aisle] || AISLE_CONFIG['Other'];
        return `${aisleConfig.emoji} ${aisle}\n${items
          .map((item) => `• ${item.amount} ${item.unit} ${item.name}`)
          .join('\n')}`;
      })
      .join('\n\n') + '\n\n— Made with Mise';

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled or share failed
        navigator.clipboard.writeText(text);
      }
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const reset = () => {
    setRecipeText('');
    setGroceryList(null);
    setRecipeName('');
    setError(null);
  };

  const loadRecent = (saved: SavedList) => {
    setGroceryList(saved.groceryList);
    setRecipeName(saved.recipeName);
  };

  const totalItems = groceryList
    ? Object.values(groceryList).flat().length
    : 0;
  const checkedItems = groceryList
    ? Object.values(groceryList).flat().filter((item) => item.checked).length
    : 0;
  const progressPercent = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={reset} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <span className="text-2xl">🍳</span>
            <h1 className="text-xl font-semibold text-stone-900">Mise</h1>
          </button>
          {groceryList && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-stone-500">
                {checkedItems}/{totalItems}
              </div>
              <div className="w-20 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2D5016] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!groceryList ? (
          /* Input View */
          <div className="space-y-6">
            <div className="text-center space-y-2 py-8">
              <h2 className="text-3xl font-bold text-stone-900">
                Recipe → Grocery List
              </h2>
              <p className="text-stone-500">
                Paste a recipe or URL. Get an organized shopping list.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={recipeText}
                  onChange={(e) => setRecipeText(e.target.value)}
                  placeholder="Paste a recipe or URL here...

Examples:
• https://www.allrecipes.com/recipe/...
• Copy/paste from any website or blog
• Or just type ingredients:

Chicken Tacos
1 lb chicken breast
2 avocados
1 bunch fresh cilantro
8 corn tortillas
2 limes"
                  className="w-full h-72 px-4 py-4 text-stone-900 bg-white border-2 border-stone-200 rounded-2xl resize-none placeholder:text-stone-400 focus:border-[#87A96B] focus:ring-2 focus:ring-[#87A96B]/20 transition-all"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!recipeText.trim() || loading}
                className="w-full bg-[#2D5016] hover:bg-[#1F3610] active:scale-[0.98] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-2xl text-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>{loadingStep || 'Getting ingredients...'}</span>
                  </>
                ) : (
                  <>
                    <span>Get Shopping List</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-stone-400">
              Works with URLs, blog posts, screenshots, handwritten notes — whatever.
            </p>

            {/* What is Mise? - For first-time visitors */}
            {recentLists.length === 0 && (
              <div className="pt-8 border-t border-stone-200 space-y-6">
                <h3 className="text-lg font-semibold text-stone-800 text-center">What is Mise?</h3>
                
                <div className="grid gap-4">
                  <div className="flex gap-4 items-start p-4 bg-white rounded-xl border border-stone-200">
                    <span className="text-2xl">📋</span>
                    <div>
                      <h4 className="font-medium text-stone-800">Recipe → Shopping List</h4>
                      <p className="text-sm text-stone-500">Paste any recipe URL or text. AI extracts ingredients and organizes them by store aisle.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start p-4 bg-white rounded-xl border border-stone-200">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h4 className="font-medium text-stone-800">No Signup Required</h4>
                      <p className="text-sm text-stone-500">Just paste and go. Your lists are saved locally on your device — we don&apos;t track you.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start p-4 bg-white rounded-xl border border-stone-200">
                    <span className="text-2xl">🛒</span>
                    <div>
                      <h4 className="font-medium text-stone-800">Shop Smarter</h4>
                      <p className="text-sm text-stone-500">Check off items as you shop. Copy to Notes or share with family. Open directly in your favorite store.</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-center text-sm text-stone-500">
                  <span className="font-medium">&quot;Mise en place&quot;</span> — French for &quot;everything in its place.&quot;
                </p>
              </div>
            )}

            {/* Recent Lists */}
            {recentLists.length > 0 && (
              <div className="pt-6 border-t border-stone-200">
                <h3 className="text-sm font-medium text-stone-500 mb-3">Recent</h3>
                <div className="space-y-2">
                  {recentLists.map((saved, i) => (
                    <button
                      key={i}
                      onClick={() => loadRecent(saved)}
                      className="w-full text-left px-4 py-3 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-stone-700">{saved.recipeName}</span>
                      <span className="text-sm text-stone-400">
                        {Object.values(saved.groceryList).flat().length} items
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">{recipeName}</h2>
                <p className="text-sm text-stone-500">{totalItems} items</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={shareList}
                  className="p-2 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                  title="Share"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button
                  onClick={copyList}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-1.5 ${
                    copied 
                      ? 'bg-[#2D5016] text-white' 
                      : 'text-stone-600 bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  {copied ? (
                    <>✓ Paste into Notes</>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 text-sm font-medium text-[#2D5016] bg-[#2D5016]/10 hover:bg-[#2D5016]/20 rounded-xl transition-colors"
                >
                  + New
                </button>
              </div>
            </div>

            {/* Aisles */}
            <div className="space-y-4">
              {Object.entries(groceryList)
                .filter(([, items]) => items.length > 0)
                .map(([aisle, items]) => {
                  const config = AISLE_CONFIG[aisle] || AISLE_CONFIG['Other'];
                  const aisleChecked = items.filter((i) => i.checked).length;
                  const allChecked = aisleChecked === items.length;

                  return (
                    <div
                      key={aisle}
                      className={`rounded-2xl border-2 overflow-hidden transition-opacity ${config.color} ${allChecked ? 'opacity-60' : ''}`}
                    >
                      <div className="px-4 py-3 flex items-center justify-between bg-white/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{config.emoji}</span>
                          <span className="font-semibold text-stone-800">{aisle}</span>
                        </div>
                        <span className="text-sm text-stone-500">
                          {aisleChecked}/{items.length}
                        </span>
                      </div>

                      <div className="divide-y divide-stone-100">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleItem(aisle, item.id)}
                            className={`flex items-center gap-4 px-4 py-3 bg-white cursor-pointer active:bg-stone-50 transition-all ${
                              item.checked ? 'opacity-50' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                item.checked
                                  ? 'bg-[#2D5016] border-[#2D5016] scale-110'
                                  : 'border-stone-300 hover:border-stone-400'
                              }`}
                            >
                              {item.checked && (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>

                            {/* Image */}
                            {item.image && (
                              <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div
                                className={`font-medium text-stone-900 ${
                                  item.checked ? 'line-through text-stone-400' : ''
                                }`}
                              >
                                {item.name}
                              </div>
                              {(item.amount || item.unit) && (
                                <div className="text-sm text-stone-500">
                                  {item.amount} {item.unit}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Completion message */}
            {progressPercent === 100 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-lg font-medium text-stone-700">All done!</p>
                <p className="text-sm text-stone-500">Time to cook something delicious.</p>
              </div>
            )}

            {/* Shop at Store */}
            <div className="pt-4 border-t border-stone-200">
              <p className="text-sm font-medium text-stone-500 mb-3">Shop this list at</p>
              <div className="flex flex-wrap gap-2">
                {STORES.map((store) => {
                  // Get unchecked items for search
                  const uncheckedItems = Object.values(groceryList)
                    .flat()
                    .filter((item) => !item.checked)
                    .slice(0, 5) // First 5 items
                    .map((item) => item.name)
                    .join(', ');
                  
                  return (
                    <a
                      key={store.name}
                      href={store.url(uncheckedItems || 'groceries')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all"
                    >
                      {store.name}
                    </a>
                  );
                })}
              </div>
              <p className="text-xs text-stone-400 mt-2">Opens store search with your ingredients</p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom progress bar */}
      {groceryList && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 safe-area-pb">
          <div className="h-1 bg-stone-100">
            <div
              className="h-full bg-[#2D5016] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-stone-600">
              {checkedItems} of {totalItems} items
            </span>
            {progressPercent === 100 ? (
              <span className="text-sm font-medium text-[#2D5016]">✓ Complete!</span>
            ) : (
              <span className="text-sm text-stone-400">
                {Math.round(progressPercent)}% done
              </span>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

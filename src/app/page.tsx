'use client';

import { useState, useEffect } from 'react';
import HowItWorks from './components/HowItWorks';

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

// Store grocery page URLs
const STORES = [
  { name: 'Walmart', url: 'https://www.walmart.com/grocery' },
  { name: 'Target', url: 'https://www.target.com/c/grocery' },
  { name: 'Kroger', url: 'https://www.kroger.com' },
  { name: 'Amazon Fresh', url: 'https://www.amazon.com/alm/storefront' },
  { name: 'Instacart', url: 'https://www.instacart.com' },
  { name: 'Costco', url: 'https://www.costco.com/grocery-household' },
];

const AISLE_CONFIG: Record<string, { emoji: string; color: string; darkColor: string }> = {
  'Produce': { emoji: '🥬', color: 'bg-green-50 border-green-200', darkColor: 'dark:bg-green-950/30 dark:border-green-800' },
  'Meat & Seafood': { emoji: '🥩', color: 'bg-red-50 border-red-200', darkColor: 'dark:bg-red-950/30 dark:border-red-800' },
  'Dairy': { emoji: '🥛', color: 'bg-blue-50 border-blue-200', darkColor: 'dark:bg-blue-950/30 dark:border-blue-800' },
  'Bakery': { emoji: '🍞', color: 'bg-amber-50 border-amber-200', darkColor: 'dark:bg-amber-950/30 dark:border-amber-800' },
  'Pantry': { emoji: '🥫', color: 'bg-orange-50 border-orange-200', darkColor: 'dark:bg-orange-950/30 dark:border-orange-800' },
  'Spices': { emoji: '🧂', color: 'bg-yellow-50 border-yellow-200', darkColor: 'dark:bg-yellow-950/30 dark:border-yellow-800' },
  'Frozen': { emoji: '🧊', color: 'bg-cyan-50 border-cyan-200', darkColor: 'dark:bg-cyan-950/30 dark:border-cyan-800' },
  'Beverages': { emoji: '🥤', color: 'bg-purple-50 border-purple-200', darkColor: 'dark:bg-purple-950/30 dark:border-purple-800' },
  'Canned Goods': { emoji: '🥫', color: 'bg-stone-100 border-stone-300', darkColor: 'dark:bg-stone-800/30 dark:border-stone-600' },
  'Oils & Vinegars': { emoji: '🫒', color: 'bg-lime-50 border-lime-200', darkColor: 'dark:bg-lime-950/30 dark:border-lime-800' },
  'Other': { emoji: '📦', color: 'bg-gray-50 border-gray-200', darkColor: 'dark:bg-gray-800/30 dark:border-gray-600' },
};

const FAQ_ITEMS = [
  {
    q: "What recipes work with Mise?",
    a: "Almost anything! Paste a URL from any recipe site, copy/paste text from a blog, or just type your ingredients. Mise uses AI to understand recipes in any format."
  },
  {
    q: "Is my data private?",
    a: "Yes. Your grocery lists are stored locally on your device. We collect minimal, anonymous usage data to monitor costs. No accounts, no personal information, no cross-session tracking."
  },
  {
    q: "Is Mise really free?",
    a: "Yep, completely free. No premium tier, no ads, no catch. We built it because we wanted it to exist."
  },
  {
    q: "Who built Mise?",
    a: "Hey, I'm Brad. Like you, I cook at home and got frustrated with existing recipe apps. Other recipe sites are great, but they require accounts and cost money. I just wanted to paste a recipe and get a grocery list. So I built Mise. Free. Private. Simple."
  }
];

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
  const [storeCopied, setStoreCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Initialize dark mode from localStorage (default to light)
  useEffect(() => {
    const stored = localStorage.getItem('mise-theme');
    if (stored === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      // Default to light mode
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
      if (!stored) {
        localStorage.setItem('mise-theme', 'light');
      }
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mise-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mise-theme', 'light');
    }
  };

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

  const copyAndOpenStore = (storeName: string, storeUrl: string) => {
    if (!groceryList) return;

    // Copy full ingredient list
    const text = Object.entries(groceryList)
      .filter(([, items]) => items.length > 0)
      .map(([aisle, items]) => {
        const aisleConfig = AISLE_CONFIG[aisle] || AISLE_CONFIG['Other'];
        return `${aisleConfig.emoji} ${aisle.toUpperCase()}\n${items
          .map((item) => `${item.amount} ${item.unit} ${item.name}`.trim())
          .join('\n')}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setStoreCopied(true);
    setTimeout(() => setStoreCopied(false), 2000);

    // Open store in new tab
    window.open(storeUrl, '_blank', 'noopener,noreferrer');
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
    <main className="min-h-screen pb-24 bg-stone-50 dark:bg-stone-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={reset} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <span className="text-2xl">🍳</span>
            <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Mise</h1>
          </button>
          <div className="flex items-center gap-3">
            {groceryList && (
              <>
                <div className="text-sm text-stone-500 dark:text-stone-400">
                  {checkedItems}/{totalItems}
                </div>
                <div className="w-20 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2D5016] dark:bg-[#87A96B] transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!groceryList ? (
          /* Input View */
          <div className="space-y-6">
            <div className="text-center space-y-2 py-8">
              <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                Recipe → Grocery List
              </h2>
              <p className="text-stone-500 dark:text-stone-400">
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
                  className="w-full h-72 px-4 py-4 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700 rounded-2xl resize-none placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-[#87A96B] focus:ring-2 focus:ring-[#87A96B]/20 transition-all"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Big CTA Button */}
              <button
                type="submit"
                disabled={!recipeText.trim() || loading}
                className="cta-shine w-full bg-[#2D5016] hover:bg-[#1F3610] dark:bg-[#87A96B] dark:hover:bg-[#6B8E4E] active:scale-[0.98] disabled:bg-stone-300 dark:disabled:bg-stone-700 disabled:cursor-not-allowed text-white dark:text-stone-900 font-semibold py-5 px-6 rounded-2xl text-xl shadow-lg shadow-[#2D5016]/20 dark:shadow-[#87A96B]/20 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
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
                    <span className="text-2xl">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Try Example button - only show for first-time visitors */}
            {recentLists.length === 0 && !recipeText && (
              <button
                onClick={() => setRecipeText(`Chicken Tacos (Serves 4)

1 lb boneless skinless chicken breast
2 ripe avocados
1 bunch fresh cilantro
8 corn tortillas
2 limes
1 cup shredded lettuce
1/2 cup sour cream
1 cup shredded Mexican cheese
1 jar salsa
1 packet taco seasoning`)}
                className="w-full py-3 text-sm font-medium text-[#2D5016] dark:text-[#87A96B] bg-[#2D5016]/5 dark:bg-[#87A96B]/10 hover:bg-[#2D5016]/10 dark:hover:bg-[#87A96B]/15 rounded-xl transition-colors"
              >
                👀 Try an Example
              </button>
            )}

            <p className="text-center text-sm text-stone-400 dark:text-stone-500">
              Works with URLs, blog posts, screenshots, handwritten notes — whatever.
            </p>

            {/* How It Works + What is Mise? - For first-time visitors */}
            {recentLists.length === 0 && (
              <div className="pt-8 border-t border-stone-200 dark:border-stone-800 space-y-8">
                {/* Interactive Demo */}
                <HowItWorks />

                <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 text-center">What is Mise?</h3>
                
                <div className="grid gap-4">
                  <div className="flex gap-4 items-start p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                    <span className="text-2xl">📋</span>
                    <div>
                      <h4 className="font-medium text-stone-800 dark:text-stone-200">Recipe → Shopping List</h4>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Paste any recipe URL or text. AI extracts ingredients and organizes them by store aisle.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h4 className="font-medium text-stone-800 dark:text-stone-200">No Signup Required</h4>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Just paste and go. Your lists are saved locally on your device — we don&apos;t track you.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                    <span className="text-2xl">🛒</span>
                    <div>
                      <h4 className="font-medium text-stone-800 dark:text-stone-200">Shop Smarter</h4>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Check off items as you shop. Copy to Notes or share with others.</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-center text-sm text-stone-500 dark:text-stone-400">
                  <span className="font-medium">&quot;Mise en place&quot;</span> — French for &quot;everything in its place.&quot;
                </p>

                {/* Testimonial Section */}
                <div className="pt-6">
                  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 text-center mb-4">What People Are Saying</h3>
                  <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      {/* Image */}
                      <div className="w-full md:w-48 flex-shrink-0">
                        <img 
                          src="/testimonial-cary.jpg" 
                          alt="Marry Me Chicken dish" 
                          className="w-full h-48 md:h-48 object-cover rounded-lg"
                        />
                      </div>
                      {/* Quote */}
                      <div className="flex-1 text-center md:text-left">
                        <svg className="w-8 h-8 text-stone-300 dark:text-stone-700 mb-3 mx-auto md:mx-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                        <p className="text-stone-700 dark:text-stone-300 mb-4 italic">
                          &quot;I used Mise to make Marry Me Chicken. The grocery list made shopping so easy—just checked items off as I went. Turned out delicious!&quot;
                        </p>
                        <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                          — Cary G., Home Cook
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="pt-6 space-y-3">
                  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 text-center">FAQ</h3>
                  {FAQ_ITEMS.map((item, i) => (
                    <div key={i} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                      >
                        <span className="font-medium text-stone-800 dark:text-stone-200">{item.q}</span>
                        <svg 
                          className={`w-5 h-5 text-stone-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className={`px-4 overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-4' : 'max-h-0'}`}>
                        <p className="text-sm text-stone-500 dark:text-stone-400">{item.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Lists */}
            {recentLists.length > 0 && (
              <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
                <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-3">Recent</h3>
                <div className="space-y-2">
                  {recentLists.map((saved, i) => (
                    <button
                      key={i}
                      onClick={() => loadRecent(saved)}
                      className="w-full text-left px-4 py-3 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors flex items-center justify-between border border-transparent dark:border-stone-700"
                    >
                      <span className="font-medium text-stone-700 dark:text-stone-300">{saved.recipeName}</span>
                      <span className="text-sm text-stone-400 dark:text-stone-500">
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
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{recipeName}</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">{totalItems} items</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={shareList}
                  className="p-2 text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors"
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
                      ? 'bg-[#2D5016] dark:bg-[#87A96B] text-white dark:text-stone-900' 
                      : 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700'
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
                  className="px-4 py-2 text-sm font-medium text-[#2D5016] dark:text-[#87A96B] bg-[#2D5016]/10 dark:bg-[#87A96B]/10 hover:bg-[#2D5016]/20 dark:hover:bg-[#87A96B]/20 rounded-xl transition-colors"
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
                      className={`rounded-2xl border-2 overflow-hidden transition-opacity ${config.color} ${config.darkColor} ${allChecked ? 'opacity-60' : ''}`}
                    >
                      <div className="px-4 py-3 flex items-center justify-between bg-white/50 dark:bg-stone-900/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{config.emoji}</span>
                          <span className="font-semibold text-stone-800 dark:text-stone-200">{aisle}</span>
                        </div>
                        <span className="text-sm text-stone-500 dark:text-stone-400">
                          {aisleChecked}/{items.length}
                        </span>
                      </div>

                      <div className="divide-y divide-stone-100 dark:divide-stone-800">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleItem(aisle, item.id)}
                            className={`flex items-center gap-4 px-4 py-3 bg-white dark:bg-stone-900 cursor-pointer active:bg-stone-50 dark:active:bg-stone-800 transition-all ${
                              item.checked ? 'opacity-50' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                item.checked
                                  ? 'bg-[#2D5016] dark:bg-[#87A96B] border-[#2D5016] dark:border-[#87A96B] scale-110'
                                  : 'border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500'
                              }`}
                            >
                              {item.checked && (
                                <svg
                                  className="w-4 h-4 text-white dark:text-stone-900"
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
                              <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 overflow-hidden flex-shrink-0">
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
                                className={`font-medium text-stone-900 dark:text-stone-100 ${
                                  item.checked ? 'line-through text-stone-400 dark:text-stone-500' : ''
                                }`}
                              >
                                {item.name}
                              </div>
                              {(item.amount || item.unit) && (
                                <div className="text-sm text-stone-500 dark:text-stone-400">
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
                <p className="text-lg font-medium text-stone-700 dark:text-stone-300">All done!</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">Time to cook something delicious.</p>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Fixed bottom progress bar */}
      {groceryList && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 safe-area-pb">
          <div className="h-1 bg-stone-100 dark:bg-stone-800">
            <div
              className="h-full bg-[#2D5016] dark:bg-[#87A96B] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-stone-600 dark:text-stone-400">
              {checkedItems} of {totalItems} items
            </span>
            {progressPercent === 100 ? (
              <span className="text-sm font-medium text-[#2D5016] dark:text-[#87A96B]">✓ Complete!</span>
            ) : (
              <span className="text-sm text-stone-400 dark:text-stone-500">
                {Math.round(progressPercent)}% done
              </span>
            )}
          </div>
        </div>
      )}

      {/* Toast notification for store copy */}
      {storeCopied && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#2D5016] dark:bg-[#87A96B] text-white dark:text-stone-900 px-6 py-3 rounded-full shadow-lg font-medium">
            ✓ Ingredients copied!
          </div>
        </div>
      )}
    </main>
  );
}

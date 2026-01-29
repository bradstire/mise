'use client';

import { useState, useEffect } from 'react';

const DEMO_STEPS = [
  {
    title: "1. Paste Recipe",
    subtitle: "URL or text",
    content: (
      <div className="bg-white dark:bg-stone-800 rounded-lg p-3 text-left text-xs font-mono">
        <div className="text-stone-400 dark:text-stone-500 mb-2">allrecipes.com/recipe/...</div>
        <div className="text-stone-600 dark:text-stone-300 space-y-1">
          <p className="font-semibold text-stone-800 dark:text-stone-100">Chicken Tacos</p>
          <p>1 lb chicken breast</p>
          <p>2 avocados, diced</p>
          <p>1 bunch cilantro</p>
          <p>8 corn tortillas</p>
          <p className="text-stone-400">...</p>
        </div>
      </div>
    )
  },
  {
    title: "2. AI Parses",
    subtitle: "Extracts & categorizes",
    content: (
      <div className="bg-white dark:bg-stone-800 rounded-lg p-3 text-left text-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 border-2 border-[#87A96B] border-t-transparent rounded-full animate-spin" />
          <span className="text-stone-500 dark:text-stone-400">Parsing ingredients...</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span className="text-stone-600 dark:text-stone-300">Identified 8 ingredients</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span className="text-stone-600 dark:text-stone-300">Matched to 4 aisles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-stone-300 dark:border-stone-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-stone-400 dark:text-stone-500">Finding images...</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "3. Shop!",
    subtitle: "Organized by aisle",
    content: (
      <div className="bg-white dark:bg-stone-800 rounded-lg p-2 text-left text-xs space-y-2">
        {/* Produce */}
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-200 mb-1">
            <span>🥬</span> Produce
          </div>
          <div className="space-y-1 text-stone-600 dark:text-stone-300">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-stone-300 dark:border-stone-600" />
              <span>2 avocados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-stone-300 dark:border-stone-600" />
              <span>1 bunch cilantro</span>
            </div>
          </div>
        </div>
        {/* Meat */}
        <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-2 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-200 mb-1">
            <span>🥩</span> Meat
          </div>
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
            <div className="w-4 h-4 rounded-full bg-[#2D5016] dark:bg-[#87A96B] flex items-center justify-center">
              <svg className="w-3 h-3 text-white dark:text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="line-through text-stone-400 dark:text-stone-500">1 lb chicken</span>
          </div>
        </div>
      </div>
    )
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % DEMO_STEPS.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 text-center">
        See How It Works
      </h3>
      
      {/* Phone mockup */}
      <div 
        className="relative mx-auto max-w-[240px]"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Phone frame */}
        <div className="bg-stone-900 dark:bg-stone-800 rounded-[2rem] p-2 shadow-xl">
          {/* Phone notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-stone-900 dark:bg-stone-800 rounded-full z-10" />
          
          {/* Screen */}
          <div className="bg-stone-50 dark:bg-stone-900 rounded-[1.5rem] overflow-hidden">
            {/* Status bar */}
            <div className="h-6 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <span className="text-[10px] text-stone-400 dark:text-stone-500">9:41</span>
            </div>
            
            {/* App header */}
            <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-700 flex items-center gap-2">
              <span className="text-lg">🍳</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200 text-sm">Mise</span>
            </div>
            
            {/* Content area with transition */}
            <div className="p-3 h-[200px] relative">
              {DEMO_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`absolute inset-3 transition-all duration-500 ${
                    i === activeStep 
                      ? 'opacity-100 translate-x-0' 
                      : i < activeStep 
                        ? 'opacity-0 -translate-x-full'
                        : 'opacity-0 translate-x-full'
                  }`}
                >
                  {step.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step indicators & labels */}
      <div className="flex justify-center gap-4">
        {DEMO_STEPS.map((step, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveStep(i);
              setIsAutoPlaying(false);
            }}
            className={`flex flex-col items-center gap-1 transition-all ${
              i === activeStep ? 'opacity-100' : 'opacity-50 hover:opacity-75'
            }`}
          >
            <div 
              className={`w-2 h-2 rounded-full transition-all ${
                i === activeStep 
                  ? 'bg-[#2D5016] dark:bg-[#87A96B] scale-125' 
                  : 'bg-stone-300 dark:bg-stone-600'
              }`}
            />
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
              {step.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

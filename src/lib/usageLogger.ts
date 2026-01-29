import fs from 'fs';
import path from 'path';

export interface UsageLogEntry {
  timestamp: string;
  clientId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUSD: number;
  model: string;
  success: boolean;
  error?: string;
  recipeName?: string;
  ingredientCount?: number;
  country?: string;
  inputType?: 'url' | 'text';
}

const LOG_PATH = path.join(process.cwd(), 'logs', 'api_usage.log');

// OpenAI GPT-4o-mini pricing (per 1M tokens)
const INPUT_COST_PER_1M = 0.15;
const OUTPUT_COST_PER_1M = 0.60;

export function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_1M;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_1M;
  return inputCost + outputCost;
}

export function logUsage(entry: UsageLogEntry): void {
  try {
    // Ensure logs directory exists
    const logDir = path.dirname(LOG_PATH);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Append as JSON line
    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFileSync(LOG_PATH, logLine, 'utf-8');
  } catch (error) {
    console.error('Failed to log usage:', error);
  }
}

export function getUsageStats(days: number = 7): {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalTokens: number;
  totalCost: number;
  averageTokensPerCall: number;
  averageCostPerCall: number;
  topCountries: Record<string, number>;
  callsByDay: Record<string, number>;
} {
  try {
    if (!fs.existsSync(LOG_PATH)) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalTokens: 0,
        totalCost: 0,
        averageTokensPerCall: 0,
        averageCostPerCall: 0,
        topCountries: {},
        callsByDay: {},
      };
    }
    
    const lines = fs.readFileSync(LOG_PATH, 'utf-8').split('\n').filter(l => l.trim());
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let totalCalls = 0;
    let successfulCalls = 0;
    let failedCalls = 0;
    let totalTokens = 0;
    let totalCost = 0;
    const countries: Record<string, number> = {};
    const callsByDay: Record<string, number> = {};
    
    for (const line of lines) {
      try {
        const entry: UsageLogEntry = JSON.parse(line);
        const entryDate = new Date(entry.timestamp);
        
        if (entryDate < cutoffDate) continue;
        
        totalCalls++;
        if (entry.success) successfulCalls++;
        else failedCalls++;
        
        totalTokens += entry.totalTokens;
        totalCost += entry.costUSD;
        
        if (entry.country) {
          countries[entry.country] = (countries[entry.country] || 0) + 1;
        }
        
        const dayKey = entryDate.toISOString().split('T')[0];
        callsByDay[dayKey] = (callsByDay[dayKey] || 0) + 1;
      } catch {
        // Skip malformed lines
      }
    }
    
    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      totalTokens,
      totalCost,
      averageTokensPerCall: totalCalls > 0 ? totalTokens / totalCalls : 0,
      averageCostPerCall: totalCalls > 0 ? totalCost / totalCalls : 0,
      topCountries: countries,
      callsByDay,
    };
  } catch (error) {
    console.error('Failed to get usage stats:', error);
    return {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalTokens: 0,
      totalCost: 0,
      averageTokensPerCall: 0,
      averageCostPerCall: 0,
      topCountries: {},
      callsByDay: {},
    };
  }
}

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Calculator,
  ArrowRight,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import {
  ALL_DENOMINATIONS,
  formatIndianCurrency,
  numberToIndianWords,
} from '../utils/currency';
import { getTargetSolutions } from '../utils/targetSolver';
import { sound } from '../utils/sound';

interface AiAssistantProps {
  currentCounts: Record<number, number>;
  activeDenominations: number[];
  currencySymbol: string;
  onApplyCombinationToCounter: (counts: Record<number, number>) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionableCombination?: Record<number, number>;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  currentCounts,
  activeDenominations,
  currencySymbol,
  onApplyCombinationToCounter,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: `Hello! I am your CashCount AI Assistant. I can analyze your current cash drawer, calculate note combinations for target amounts, check how many notes make any value, and optimize cash splits. All financial math is strictly deterministic. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Quick prompt suggestions
  const suggestedQuestions = [
    'Summarize my current cash drawer',
    'How many ₹500 notes make ₹15,000?',
    'I need ₹7,500 with balanced notes',
    'What is my highest denomination?',
    'How much change can I give for ₹2,000?',
  ];

  // Deterministic calculation & smart response engine
  const processQuery = (rawQuery: string): { reply: string; combination?: Record<number, number> } => {
    const q = rawQuery.toLowerCase().trim();

    // 1. Current drawer summary
    if (
      q.includes('current') ||
      q.includes('drawer') ||
      q.includes('summary') ||
      q.includes('what do i have') ||
      q.includes('how much cash')
    ) {
      let totalCash = 0;
      let totalNotes = 0;
      const lines: string[] = [];

      ALL_DENOMINATIONS.forEach((d) => {
        const count = currentCounts[d.value] || 0;
        if (count > 0) {
          totalNotes += count;
          const subtotal = d.value * count;
          totalCash += subtotal;
          lines.push(`• ${currencySymbol}${d.value}: ${count} notes = ${formatIndianCurrency(subtotal, currencySymbol)}`);
        }
      });

      if (totalCash === 0) {
        return {
          reply: `Your counter is currently empty (${currencySymbol}0). Use the + and - buttons to log notes, or ask me to prepare a target denomination combination!`,
        };
      }

      return {
        reply: `**Current Cash Drawer Breakdown:**\n\n${lines.join('\n')}\n\n**Total Notes:** ${totalNotes} physical pieces\n**Grand Total:** ${formatIndianCurrency(totalCash, currencySymbol)} (${numberToIndianWords(totalCash)})\n\nDeterministic calculation verified.`,
      };
    }

    // 2. Highest denomination inquiry
    if (q.includes('highest') || q.includes('largest')) {
      const active = ALL_DENOMINATIONS.filter((d) => (currentCounts[d.value] || 0) > 0);
      if (active.length === 0) {
        return { reply: `You currently have 0 notes in your counter.` };
      }
      const highest = Math.max(...active.map((d) => d.value));
      const count = currentCounts[highest] || 0;
      return {
        reply: `Your highest denomination note in the counter is **${currencySymbol}${highest}** (${count} notes totaling ${formatIndianCurrency(highest * count, currencySymbol)}).`,
      };
    }

    // 3. "How many [denomination] notes make [amount]?"
    // e.g., "How many 500 notes make 10000" or "How many 100 notes in 4500"
    const howManyMatch = q.match(/(\d+)\s*(?:note|notes|rs|inr|₹)?\s*(?:make|in|for|equal)\s*(?:rs|inr|₹)?\s*([\d,]+)/i);
    const altMatch = q.match(/how many\s*(?:rs|inr|₹)?\s*(\d+)\D+([\d,]+)/i);

    const denomVal = howManyMatch ? parseInt(howManyMatch[1], 10) : altMatch ? parseInt(altMatch[1], 10) : null;
    const targetValRaw = howManyMatch ? howManyMatch[2] : altMatch ? altMatch[2] : null;

    if (denomVal && targetValRaw) {
      const targetVal = parseInt(targetValRaw.replace(/,/g, ''), 10);
      if (denomVal > 0 && targetVal > 0) {
        const count = Math.floor(targetVal / denomVal);
        const remainder = targetVal % denomVal;
        if (remainder === 0) {
          return {
            reply: `**Exact Match:** **${count} notes** of ${currencySymbol}${denomVal} make exactly **${formatIndianCurrency(targetVal, currencySymbol)}**.\n\n${currencySymbol}${denomVal} × ${count} = ${formatIndianCurrency(targetVal, currencySymbol)}.`,
            combination: { [denomVal]: count },
          };
        } else {
          return {
            reply: `**${count} notes** of ${currencySymbol}${denomVal} make ${formatIndianCurrency(count * denomVal, currencySymbol)}, leaving a remainder of **${currencySymbol}${remainder}** to reach ${formatIndianCurrency(targetVal, currencySymbol)}.`,
          };
        }
      }
    }

    // 4. Target amount combination request
    // e.g. "I need ₹7,500 with balanced notes" or "target 5000" or "give me 12000"
    const numberMatches = q.match(/(?:rs\.?|inr|₹)?\s*([\d,]+)/g);
    if (numberMatches && numberMatches.length > 0) {
      // Find candidate target amount
      const cleanNums = numberMatches
        .map((s) => parseInt(s.replace(/[^0-9]/g, ''), 10))
        .filter((n) => n >= 10);

      if (cleanNums.length > 0) {
        const target = cleanNums[0];
        const solutions = getTargetSolutions(target, activeDenominations);
        if (solutions.length > 0) {
          const isBalanced = q.includes('balanced') || q.includes('mix') || q.includes('change');
          const chosen = isBalanced ? solutions[1] || solutions[0] : solutions[0];

          const breakdownParts: string[] = [];
          Object.entries(chosen.counts).forEach(([val, qty]) => {
            if (qty > 0) {
              breakdownParts.push(`• ${currencySymbol}${val} × ${qty} notes = ${formatIndianCurrency(Number(val) * qty, currencySymbol)}`);
            }
          });

          return {
            reply: `Here is the optimal breakdown for **${formatIndianCurrency(target, currencySymbol)}** (${chosen.strategyName}):\n\n${breakdownParts.join('\n')}\n\n**Total Banknotes:** ${chosen.totalNotes} notes\n**Exact Fit:** ${chosen.isExact ? 'Yes' : `Remainder of ${currencySymbol}${chosen.remainder}`}\n\nYou can click **"Load into Counter"** below to populate these notes immediately.`,
            combination: chosen.counts,
          };
        }
      }
    }

    // 5. Change for a customer note (e.g. Change for ₹2,000 or ₹500)
    if (q.includes('change')) {
      const targetMatch = q.match(/(\d+)/);
      const target = targetMatch ? parseInt(targetMatch[1], 10) : 500;
      const smallerDenoms = activeDenominations.filter((d) => d < target);

      if (smallerDenoms.length > 0) {
        const solutions = getTargetSolutions(target, smallerDenoms);
        const best = solutions[1] || solutions[0];
        const parts: string[] = [];
        Object.entries(best.counts).forEach(([val, qty]) => {
          if (qty > 0) parts.push(`• ${currencySymbol}${val} × ${qty} notes`);
        });

        return {
          reply: `To provide customer change for **${currencySymbol}${target}** using smaller notes:\n\n${parts.join('\n')}\n\nTotal: ${best.totalNotes} notes totaling ${formatIndianCurrency(best.totalAmount, currencySymbol)}.`,
          combination: best.counts,
        };
      }
    }

    // 6. General fallback explaining capabilities
    return {
      reply: `I can help with Indian currency calculations! Try asking:\n• "How many ₹500 notes make ₹25,000?"\n• "I need ₹12,500 with balanced notes"\n• "Summarize my current cash drawer"\n• "How to give change for ₹500?"\n\nAll arithmetic is calculated deterministically for complete accuracy.`,
    };
  };

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    // Simulate natural assistant responsiveness (150ms)
    setTimeout(() => {
      const response = processQuery(currentInput);
      const botMessage: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        actionableCombination: response.combination,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      sound.playClick(1.2);
    }, 250);
  };

  const handleApplyCombination = (combo: Record<number, number>) => {
    onApplyCombinationToCounter(combo);
    sound.playSuccess();
  };

  return (
    <div className="flex h-[600px] flex-col rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Assistant Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                CashCount AI Assistant
              </h3>
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Deterministic Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Instant cash breakdown & note combination logic
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Precision Financial Math
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:max-w-[75%] ${
                  isUser
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'border border-slate-100 bg-slate-50 text-slate-800 shadow-2xs dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.text.split('\n').map((line, idx) => (
                    <span key={idx}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>

                {/* If there is an actionable combination attached, render a direct Load button */}
                {msg.actionableCombination && (
                  <div className="mt-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleApplyCombination(msg.actionableCombination!)}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs transition-colors hover:bg-emerald-100 active:scale-95 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
                    >
                      <span>Load into Cash Counter</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <div
                  className={`mt-1.5 text-[10px] ${
                    isUser ? 'text-slate-300 dark:text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Bot className="h-4 w-4 animate-bounce text-emerald-600" />
            <span>Calculating cash equations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Strip */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-600 dark:text-slate-300">
          <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span className="shrink-0 text-slate-400">Try:</span>
          {suggestedQuestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setInputText(prompt);
              }}
              className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="border-t border-slate-100 p-3.5 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about note combinations, customer change, target cash totals..."
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs transition-colors hover:bg-emerald-700 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

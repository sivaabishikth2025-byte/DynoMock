import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Real interview problems for all fields
const ALL_PROBLEMS = [
  // ========== SOFTWARE ENGINEERING (SWE) ==========
  {
    title: "Two Sum",
    category: "Arrays",
    field: "SWE",
    difficulty_elo: 1100,
    statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."],
    hints: ["Think about using a hash map to store complements", "Can you solve it in one pass?"],
    solution_approach: "Use a hash map to store each number's complement. For each number, check if its complement exists in the map.",
    tags: ["arrays", "hash-table", "google", "meta", "amazon"],
    companies: ["Google", "Meta", "Amazon", "Microsoft"],
  },
  {
    title: "Valid Parentheses",
    category: "Strings",
    field: "SWE",
    difficulty_elo: 1150,
    statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: "true", explanation: "Simple matching pair" },
      { input: 's = "()[]{}"', output: "true", explanation: "Multiple valid pairs" },
      { input: 's = "(]"', output: "false", explanation: "Mismatched brackets" }
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
    hints: ["Use a stack data structure", "Push opening brackets, pop for closing"],
    solution_approach: "Use a stack. Push opening brackets, and for closing brackets, check if the top of stack matches.",
    tags: ["strings", "stack", "google", "amazon"],
    companies: ["Google", "Amazon", "Meta"],
  },
  {
    title: "Merge Two Sorted Lists",
    category: "Linked Lists",
    field: "SWE",
    difficulty_elo: 1200,
    statement: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]", explanation: "Merge maintaining sorted order" }
    ],
    constraints: ["The number of nodes in both lists is in the range [0, 50]", "-100 <= Node.val <= 100"],
    hints: ["Use a dummy head node", "Compare values and advance pointers"],
    solution_approach: "Use two pointers and a dummy head. Compare nodes and link the smaller one.",
    tags: ["linked-list", "recursion", "microsoft", "amazon"],
    companies: ["Microsoft", "Amazon", "Apple"],
  },
  {
    title: "Maximum Subarray",
    category: "Dynamic Programming",
    field: "SWE",
    difficulty_elo: 1250,
    statement: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." }
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    hints: ["Consider Kadane's algorithm", "Track current sum and max sum"],
    solution_approach: "Kadane's algorithm: maintain current subarray sum, reset if negative.",
    tags: ["dynamic-programming", "arrays", "google", "linkedin"],
    companies: ["Google", "LinkedIn", "Microsoft"],
  },
  {
    title: "LRU Cache",
    category: "System Design",
    field: "SWE",
    difficulty_elo: 1450,
    statement: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get(key) and put(key, value) operations in O(1) time complexity.",
    examples: [
      { input: "LRUCache cache = new LRUCache(2); cache.put(1,1); cache.put(2,2); cache.get(1);", output: "returns 1", explanation: "Cache hits return the value" }
    ],
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4"],
    hints: ["Use a hash map + doubly linked list", "Hash map for O(1) lookup, linked list for order"],
    solution_approach: "Combine hash map with doubly linked list. Hash map stores key->node, list maintains recency order.",
    tags: ["design", "hash-table", "linked-list", "amazon", "microsoft"],
    companies: ["Amazon", "Microsoft", "Google", "Meta"],
  },
  {
    title: "Binary Tree Level Order Traversal",
    category: "Trees",
    field: "SWE",
    difficulty_elo: 1300,
    statement: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]", explanation: "Level by level traversal" }
    ],
    constraints: ["The number of nodes is in the range [0, 2000]"],
    hints: ["Use BFS with a queue", "Track levels using queue size"],
    solution_approach: "BFS using a queue. Process nodes level by level.",
    tags: ["trees", "bfs", "meta", "amazon"],
    companies: ["Meta", "Amazon", "Microsoft"],
  },
  {
    title: "Number of Islands",
    category: "Graphs",
    field: "SWE",
    difficulty_elo: 1350,
    statement: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    examples: [
      { input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: "2", explanation: "Two separate islands" }
    ],
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300"],
    hints: ["Use DFS or BFS to explore each island", "Mark visited cells"],
    solution_approach: "DFS/BFS from each unvisited land cell. Mark visited and count components.",
    tags: ["graphs", "dfs", "bfs", "amazon", "google"],
    companies: ["Amazon", "Google", "Meta"],
  },
  
  // ========== QUANTITATIVE FINANCE (QF) ==========
  {
    title: "Expected Value of Dice Rolls",
    category: "Probability",
    field: "QF",
    difficulty_elo: 1150,
    statement: "You roll a fair six-sided die. What is the expected number of rolls needed until you get a 6?",
    examples: [
      { input: "Single fair die", output: "6", explanation: "E[X] = 1/p = 1/(1/6) = 6 rolls on average" }
    ],
    constraints: ["Fair six-sided die", "Independent rolls"],
    hints: ["This is a geometric distribution", "E[X] = 1/p for geometric distribution"],
    solution_approach: "Geometric distribution with p=1/6. Expected value E[X] = 1/p = 6.",
    tags: ["probability", "expected-value", "jane-street", "citadel"],
    companies: ["Jane Street", "Citadel", "Two Sigma"],
  },
  {
    title: "Monty Hall Problem",
    category: "Probability",
    field: "QF",
    difficulty_elo: 1200,
    statement: "You're on a game show with 3 doors. Behind one door is a car; behind the others, goats. You pick door 1. The host, who knows what's behind the doors, opens door 3 (which has a goat). Should you switch to door 2?",
    examples: [
      { input: "Initial choice: Door 1, Host opens: Door 3", output: "Yes, switch", explanation: "Switching gives 2/3 probability of winning" }
    ],
    constraints: ["Host always opens a door with a goat", "Host never opens your chosen door"],
    hints: ["Consider all initial scenarios", "What happens to probability after host reveals?"],
    solution_approach: "Initially 1/3 chance of being right. When host reveals goat, the 2/3 probability transfers to the remaining door. Switch to win 2/3 of the time.",
    tags: ["probability", "conditional-probability", "jane-street", "optiver"],
    companies: ["Jane Street", "Optiver", "SIG"],
  },
  {
    title: "Coin Flip Until Two Heads",
    category: "Probability",
    field: "QF",
    difficulty_elo: 1250,
    statement: "What is the expected number of fair coin flips needed to get two heads in a row?",
    examples: [
      { input: "Fair coin, need HH", output: "6", explanation: "Using Markov chain analysis" }
    ],
    constraints: ["Fair coin (p=0.5)", "Need consecutive heads"],
    hints: ["Set up states: Start, H (one head), HH (done)", "Use system of equations for expected values"],
    solution_approach: "Let E₀ be expected flips from start, E₁ from having one H. E₀ = 1 + 0.5×E₁ + 0.5×E₀, E₁ = 1 + 0.5×0 + 0.5×E₀. Solving: E₀ = 6.",
    tags: ["probability", "markov-chains", "two-sigma", "de-shaw"],
    companies: ["Two Sigma", "DE Shaw", "Citadel"],
  },
  {
    title: "Option Pricing Basics",
    category: "Options",
    field: "QF",
    difficulty_elo: 1350,
    statement: "A stock is currently at $100. In one period it can go up to $120 or down to $80. The risk-free rate is 5%. Price a call option with strike $100 using risk-neutral pricing.",
    examples: [
      { input: "S₀=$100, u=1.2, d=0.8, r=0.05, K=$100", output: "$12.38", explanation: "Using risk-neutral probability" }
    ],
    constraints: ["One-period binomial model", "No arbitrage"],
    hints: ["Calculate risk-neutral probability q", "q = (e^r - d)/(u - d)"],
    solution_approach: "Risk-neutral probability q = (1.05 - 0.8)/(1.2 - 0.8) = 0.625. Option payoffs: up=$20, down=$0. Price = e^(-0.05) × (0.625×20 + 0.375×0) ≈ $12.38",
    tags: ["options", "derivatives", "goldman", "morgan-stanley"],
    companies: ["Goldman Sachs", "Morgan Stanley", "JP Morgan"],
  },
  {
    title: "Mental Math: Multiply 37 × 43",
    category: "Mental Math",
    field: "QF",
    difficulty_elo: 1100,
    statement: "Calculate 37 × 43 mentally as quickly as possible. Explain your approach.",
    examples: [
      { input: "37 × 43", output: "1591", explanation: "Use (40-3)(40+3) = 1600 - 9 = 1591" }
    ],
    constraints: ["Mental calculation only", "Speed matters"],
    hints: ["Look for patterns near round numbers", "Use difference of squares: (a-b)(a+b) = a² - b²"],
    solution_approach: "37 × 43 = (40-3)(40+3) = 40² - 3² = 1600 - 9 = 1591",
    tags: ["mental-math", "arithmetic", "jane-street", "optiver"],
    companies: ["Jane Street", "Optiver", "SIG", "Akuna"],
  },
  {
    title: "Card Probability",
    category: "Probability",
    field: "QF",
    difficulty_elo: 1200,
    statement: "From a standard 52-card deck, you draw 5 cards. What's the probability of getting exactly one pair (two cards of the same rank, with the other three cards all different ranks)?",
    examples: [
      { input: "5-card hand from 52 cards", output: "≈ 42.26%", explanation: "Most common poker hand type" }
    ],
    constraints: ["Standard 52-card deck", "5-card hand"],
    hints: ["Choose which rank is paired", "Choose 2 suits for the pair", "Choose 3 different ranks for remaining cards"],
    solution_approach: "C(13,1)×C(4,2)×C(12,3)×4³ / C(52,5) = 13×6×220×64 / 2,598,960 ≈ 42.26%",
    tags: ["probability", "combinatorics", "citadel", "jump"],
    companies: ["Citadel", "Jump Trading", "HRT"],
  },
  {
    title: "Stochastic Process: Random Walk",
    category: "Stochastic Calculus",
    field: "QF",
    difficulty_elo: 1400,
    statement: "A particle starts at position 0. At each step, it moves +1 with probability p or -1 with probability 1-p. What is the probability it ever reaches position +N (before going to -∞)?",
    examples: [
      { input: "p=0.6, N=3", output: "0.857", explanation: "Using gambler's ruin formula" }
    ],
    constraints: ["p ≠ 0.5", "N > 0"],
    hints: ["This is the gambler's ruin problem", "Set up recurrence for hitting probability"],
    solution_approach: "Let q = (1-p)/p. For p ≠ 0.5: P(reach +N from 0) = (1 - q^0)/(1 - q^N) = 1/(1 + q + q² + ... + q^(N-1)). For p > 0.5: this approaches 1 as N→∞.",
    tags: ["stochastic-processes", "random-walk", "de-shaw", "renaissance"],
    companies: ["DE Shaw", "Renaissance", "Two Sigma"],
  },
  {
    title: "Market Making Spread",
    category: "Brain Teasers",
    field: "QF",
    difficulty_elo: 1300,
    statement: "You are a market maker. A stock's true value is uniformly distributed between $10 and $20. An informed trader who knows the true value will buy if your ask is below true value and sell if your bid is above. How should you set your bid-ask spread?",
    examples: [
      { input: "Value ~ U[10,20]", output: "Bid: $10, Ask: $20", explanation: "Adverse selection requires wide spread" }
    ],
    constraints: ["Uniform distribution on [10,20]", "Informed trader knows true value"],
    hints: ["Consider adverse selection", "When will you get a buy order? A sell order?"],
    solution_approach: "With 100% informed traders, you'll only get buy orders when ask < true value (losing money) and sell orders when bid > true value (losing money). To not lose money: bid ≤ 10, ask ≥ 20.",
    tags: ["market-making", "adverse-selection", "jane-street", "hrt"],
    companies: ["Jane Street", "HRT", "Virtu", "Citadel Securities"],
  },
  {
    title: "Broken Stick Problem",
    category: "Probability",
    field: "QF",
    difficulty_elo: 1350,
    statement: "A stick of length 1 is broken at two random points. What is the probability that the three pieces can form a triangle?",
    examples: [
      { input: "Stick of length 1, two random breaks", output: "1/4", explanation: "Triangle inequality must hold for all three pairs" }
    ],
    constraints: ["Uniform random breaks", "Pieces must satisfy triangle inequality"],
    hints: ["Let break points be X and Y where X < Y", "What are the conditions for a valid triangle?"],
    solution_approach: "For pieces of length X, Y-X, 1-Y to form triangle: each piece < 1/2. The probability region is a triangle with area 1/4 of the unit square.",
    tags: ["probability", "geometry", "two-sigma", "citadel"],
    companies: ["Two Sigma", "Citadel", "DE Shaw"],
  },
  
  // ========== INVESTMENT BANKING (IB) ==========
  {
    title: "Walk Me Through a DCF",
    category: "Valuation",
    field: "IB",
    difficulty_elo: 1150,
    statement: "Walk me through a Discounted Cash Flow (DCF) analysis step by step. What are the key inputs and assumptions?",
    examples: [
      { input: "General DCF walkthrough", output: "5-step process", explanation: "Project FCF → Calculate WACC → Discount → Terminal Value → Sum" }
    ],
    constraints: ["Know the 5-10 year projection period", "Understand terminal value methods"],
    hints: ["Start with projecting unlevered free cash flows", "Remember both perpetuity growth and exit multiple methods for terminal value"],
    solution_approach: "1) Project 5-10 years of Free Cash Flow (EBIT×(1-t) + D&A - CapEx - ΔNWC). 2) Calculate WACC. 3) Discount FCFs to present value. 4) Calculate Terminal Value (Gordon Growth or Exit Multiple). 5) Sum PV of FCFs + PV of Terminal Value = Enterprise Value.",
    tags: ["dcf", "valuation", "goldman", "morgan-stanley"],
    companies: ["Goldman Sachs", "Morgan Stanley", "JP Morgan"],
  },
  {
    title: "Calculate WACC",
    category: "Valuation",
    field: "IB",
    difficulty_elo: 1200,
    statement: "A company has market cap of $500M, debt of $200M, cost of equity 12%, cost of debt 6%, and tax rate 25%. Calculate the WACC.",
    examples: [
      { input: "E=$500M, D=$200M, Re=12%, Rd=6%, t=25%", output: "9.5%", explanation: "Weighted average of cost of equity and after-tax cost of debt" }
    ],
    constraints: ["Use market values not book values", "Cost of debt is pre-tax"],
    hints: ["WACC = (E/V)×Re + (D/V)×Rd×(1-t)", "V = E + D"],
    solution_approach: "V = 500 + 200 = $700M. WACC = (500/700)×12% + (200/700)×6%×(1-25%) = 8.57% + 1.29% = 9.86% ≈ 9.9%",
    tags: ["wacc", "valuation", "jp-morgan", "bofa"],
    companies: ["JP Morgan", "Bank of America", "Citi"],
  },
  {
    title: "LBO Model Basics",
    category: "LBO",
    field: "IB",
    difficulty_elo: 1350,
    statement: "A PE firm acquires a company for $1B using 60% debt. The company generates $100M EBITDA annually. Assuming no growth, debt paydown from FCF, and exit at 10x EBITDA after 5 years, what's the approximate equity IRR?",
    examples: [
      { input: "Purchase: $1B, 60% debt, $100M EBITDA, 10x exit", output: "~25% IRR", explanation: "Debt paydown and multiple arbitrage drive returns" }
    ],
    constraints: ["Assume interest rate ~6-8%", "Simplified model ignoring taxes and CapEx"],
    hints: ["Calculate initial equity", "Figure out debt paydown over 5 years", "Calculate exit equity value"],
    solution_approach: "Initial Equity = $400M (40% of $1B). Exit EV = 10 × $100M = $1B. Assuming ~$200M debt paid down, exit debt = $400M. Exit Equity = $600M. IRR = (600/400)^(1/5) - 1 ≈ 8.4%. With more aggressive assumptions or multiple expansion, can reach 20-25%.",
    tags: ["lbo", "pe", "kkr", "blackstone"],
    companies: ["Lazard", "Evercore", "Goldman Sachs"],
  },
  {
    title: "M&A Accretion/Dilution",
    category: "M&A",
    field: "IB",
    difficulty_elo: 1300,
    statement: "Company A (stock price $50, 100M shares, P/E 20x) acquires Company B (stock price $30, 50M shares, P/E 15x) in an all-stock deal at a 20% premium. Is this deal accretive or dilutive to A's EPS?",
    examples: [
      { input: "Acquirer P/E 20x, Target P/E 15x, 20% premium", output: "Accretive", explanation: "Buying earnings at lower multiple than own P/E" }
    ],
    constraints: ["All-stock deal", "No synergies in basic analysis"],
    hints: ["Compare what you're paying per dollar of earnings to your own P/E", "Premium-adjusted P/E of target vs acquirer P/E"],
    solution_approach: "Target value with premium: $30 × 1.2 × 50M = $1.8B. Target earnings: ($30 × 50M)/15 = $100M. Effective P/E paid: 18x. Since 18x < 20x (acquirer P/E), deal is ACCRETIVE.",
    tags: ["ma", "accretion-dilution", "goldman", "lazard"],
    companies: ["Goldman Sachs", "Lazard", "Centerview"],
  },
  {
    title: "Enterprise Value vs Equity Value",
    category: "Valuation",
    field: "IB",
    difficulty_elo: 1100,
    statement: "Explain the difference between Enterprise Value and Equity Value. When would you use each? How do you bridge from one to the other?",
    examples: [
      { input: "Conceptual question", output: "EV = value to all investors, Equity = value to shareholders", explanation: "EV = Equity + Net Debt" }
    ],
    constraints: ["Must know the bridge formula", "Understand when to use each"],
    hints: ["Think about who has claims on the business", "Which cash flows correspond to which value?"],
    solution_approach: "Enterprise Value = value of core business operations to ALL capital providers (debt + equity). Equity Value = value to shareholders only. Bridge: EV = Equity Value + Debt - Cash + Preferred + Minority Interest. Use EV multiples with unlevered metrics (EBITDA, Revenue), Equity multiples with levered metrics (Net Income, EPS).",
    tags: ["valuation", "enterprise-value", "bofa", "citi"],
    companies: ["Bank of America", "Citi", "Barclays"],
  },
  {
    title: "Three Financial Statements",
    category: "Accounting",
    field: "IB",
    difficulty_elo: 1100,
    statement: "Walk me through how a $10 increase in Depreciation flows through the three financial statements. Assume a 25% tax rate.",
    examples: [
      { input: "$10 depreciation increase, 25% tax", output: "NI down $7.50, CFO up $2.50", explanation: "Non-cash expense creates tax shield" }
    ],
    constraints: ["Understand non-cash nature of D&A", "Know the tax shield benefit"],
    hints: ["Start with Income Statement impact", "What's added back in Cash Flow Statement?"],
    solution_approach: "Income Statement: EBIT down $10, Taxes down $2.50 (10×25%), Net Income down $7.50. Cash Flow Statement: NI down $7.50, add back D&A $10, CFO up $2.50. Balance Sheet: PP&E down $10, Retained Earnings down $7.50, Cash up $2.50 → balanced.",
    tags: ["accounting", "financial-statements", "evercore", "moelis"],
    companies: ["Evercore", "Moelis", "PJT Partners"],
  },
  {
    title: "Why Investment Banking?",
    category: "Behavioral",
    field: "IB",
    difficulty_elo: 1050,
    statement: "Why do you want to work in investment banking? Why our firm specifically?",
    examples: [
      { input: "Behavioral question", output: "Structured answer", explanation: "Cover interest in finance, deals, specific firm culture" }
    ],
    constraints: ["Be genuine but polished", "Research the specific firm"],
    hints: ["Have 2-3 specific reasons", "Connect your background to banking", "Show you've researched the firm's recent deals"],
    solution_approach: "Structure: 1) What draws you to IB (deals, learning, analytical nature). 2) Why now in your career. 3) Why this specific firm (culture, deal flow, people you've spoken to, specific recent transactions). Be specific and authentic.",
    tags: ["behavioral", "fit", "all-banks"],
    companies: ["Goldman Sachs", "Morgan Stanley", "JP Morgan", "All Banks"],
  },
  {
    title: "Comparable Company Analysis",
    category: "Valuation",
    field: "IB",
    difficulty_elo: 1200,
    statement: "How would you select comparable companies for a software company valuation? What multiples would you use?",
    examples: [
      { input: "Software company comps", output: "EV/Revenue, EV/EBITDA", explanation: "High-growth software often uses revenue multiples" }
    ],
    constraints: ["Consider business model, size, growth rate", "Industry-specific metrics matter"],
    hints: ["Start with same industry and business model", "Consider size, growth, margins, geography"],
    solution_approach: "Selection criteria: 1) Same industry (SaaS vs on-prem). 2) Similar business model (B2B vs B2C). 3) Comparable size (revenue range). 4) Similar growth profile. 5) Geographic focus. Multiples for software: EV/Revenue (especially if unprofitable), EV/ARR for SaaS, EV/EBITDA if profitable. Consider Rule of 40 (growth + margin).",
    tags: ["comps", "valuation", "qatalyst", "morgan-stanley"],
    companies: ["Qatalyst", "Morgan Stanley", "Goldman Sachs"],
  },
  {
    title: "Merger vs Acquisition",
    category: "M&A",
    field: "IB",
    difficulty_elo: 1150,
    statement: "What is the difference between a merger and an acquisition? What are the different deal structures?",
    examples: [
      { input: "M&A structures", output: "Stock purchase, Asset purchase, Merger", explanation: "Different legal and tax implications" }
    ],
    constraints: ["Understand legal distinctions", "Know tax implications"],
    hints: ["Consider who survives legally", "Think about liability and tax basis"],
    solution_approach: "Merger: Two companies combine, typically one survives (or new entity formed). Acquisition: One company buys another. Structures: 1) Stock Purchase - buy shares, assume all liabilities. 2) Asset Purchase - buy specific assets, can avoid some liabilities. 3) Merger - statutory combination. Tax: Stock purchase = seller's tax basis carries over. Asset purchase = buyer gets step-up in basis.",
    tags: ["ma", "deal-structure", "jp-morgan", "bofa"],
    companies: ["JP Morgan", "Bank of America", "Goldman Sachs"],
  },
  {
    title: "Pitch Book Components",
    category: "Behavioral",
    field: "IB",
    difficulty_elo: 1100,
    statement: "What are the key components of an M&A sell-side pitch book? Walk me through the typical structure.",
    examples: [
      { input: "Sell-side pitch structure", output: "8-10 key sections", explanation: "From executive summary to valuation to process" }
    ],
    constraints: ["Know the logical flow", "Understand purpose of each section"],
    hints: ["Start with executive summary", "End with process recommendations"],
    solution_approach: "Key sections: 1) Executive Summary. 2) Situation Overview. 3) Strategic Alternatives Analysis. 4) Market/Industry Overview. 5) Company Overview & Positioning. 6) Preliminary Valuation (comps, DCF, precedents). 7) Potential Buyer Universe. 8) Process Recommendations. 9) Bank Credentials. 10) Appendix with detailed analyses.",
    tags: ["pitch-book", "process", "lazard", "evercore"],
    companies: ["Lazard", "Evercore", "Goldman Sachs"],
  },
];

export async function POST() {
  try {
    // Clear existing problems (optional - comment out if you want to keep existing)
    // await supabaseAdmin.from("problems").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert all problems
    const problemsToInsert = ALL_PROBLEMS.map((problem) => ({
      title: problem.title,
      category: problem.category,
      field: problem.field,
      difficulty_elo: problem.difficulty_elo,
      statement: problem.statement,
      examples: problem.examples,
      constraints: problem.constraints,
      hints: problem.hints,
      solution_approach: problem.solution_approach,
      tags: problem.tags,
      companies: problem.companies,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabaseAdmin
      .from("problems")
      .upsert(problemsToInsert, { 
        onConflict: "title",
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error("Error seeding problems:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Count by field
    const counts = {
      SWE: ALL_PROBLEMS.filter((p) => p.field === "SWE").length,
      QF: ALL_PROBLEMS.filter((p) => p.field === "QF").length,
      IB: ALL_PROBLEMS.filter((p) => p.field === "IB").length,
    };

    return NextResponse.json({
      success: true,
      message: `Seeded ${data?.length || problemsToInsert.length} problems`,
      counts,
      problems: data,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed problems" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return counts of problems by field
  try {
    const { data: problems, error } = await supabaseAdmin
      .from("problems")
      .select("field, category");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const counts = problems?.reduce((acc, p) => {
      const field = p.field || "SWE";
      acc[field] = (acc[field] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ counts, total: problems?.length || 0 });
  } catch (error) {
    console.error("Error fetching problem counts:", error);
    return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
  }
}


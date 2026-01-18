import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const CODING_PROBLEMS = [
  {
    title: "Valid Parentheses",
    statement: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
    category: "Stacks",
    difficulty_elo: 1100,
    field: "software_engineering",
    company: "Google",
    role_level: "junior",
    hints: [
      "Think about using a stack data structure",
      "When you see an opening bracket, push it. When you see a closing bracket, check if it matches.",
      "What should happen if the stack is empty when you see a closing bracket?"
    ],
    solution_approach: "Use a stack. Push opening brackets and pop when you see matching closing brackets.",
    test_cases: [],
    starter_code: {},
    tags: ["stack", "string"]
  },
  {
    title: "Two Sum",
    statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    category: "Arrays",
    difficulty_elo: 1000,
    field: "software_engineering",
    company: "Amazon",
    role_level: "junior",
    hints: ["A brute force approach would be O(n²) - can you do better?", "Think about what value you need to find for each element", "A hash map can help you look up values in O(1) time"],
    solution_approach: "Use a hash map to store values and their indices. For each number, check if (target - number) exists in the map.",
    test_cases: [], starter_code: {}, tags: ["array", "hash-table"]
  },
  {
    title: "Reverse Linked List",
    statement: "Given the head of a singly linked list, reverse the list, and return the reversed list. The list can have up to 5000 nodes with values between -5000 and 5000.",
    category: "Linked Lists",
    difficulty_elo: 1150,
    field: "software_engineering",
    company: "Microsoft",
    role_level: "junior",
    hints: ["Think about what pointers you need to keep track of", "You need to modify the 'next' pointer of each node", "Consider using three pointers: previous, current, and next"],
    solution_approach: "Iterate through the list, reversing each pointer. Keep track of previous, current, and next nodes.",
    test_cases: [], starter_code: {}, tags: ["linked-list", "recursion"]
  },
  {
    title: "Binary Search",
    statement: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return -1. You must write an algorithm with O(log n) runtime complexity.",
    category: "Binary Search",
    difficulty_elo: 1050,
    field: "software_engineering",
    company: "Facebook",
    role_level: "junior",
    hints: ["The array is sorted - how can you use this property?", "Instead of checking every element, can you eliminate half the array each time?", "Compare the middle element with the target"],
    solution_approach: "Use two pointers (left, right). Compare middle element with target, then search the appropriate half.",
    test_cases: [], starter_code: {}, tags: ["binary-search", "array"]
  },
  {
    title: "Maximum Subarray",
    statement: "Given an integer array nums, find the subarray with the largest sum, and return its sum. A subarray is a contiguous non-empty sequence of elements within an array.",
    category: "Dynamic Programming",
    difficulty_elo: 1200,
    field: "software_engineering",
    company: "Apple",
    role_level: "mid",
    hints: ["Think about whether it's worth including the previous elements", "At each position, you either extend the previous subarray or start a new one", "This is known as Kadane's algorithm"],
    solution_approach: "Use Kadane's algorithm. Track current sum and max sum. Reset current sum if it becomes negative.",
    test_cases: [], starter_code: {}, tags: ["dynamic-programming", "array"]
  },
  {
    title: "Merge Two Sorted Lists",
    statement: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    category: "Linked Lists",
    difficulty_elo: 1100,
    field: "software_engineering",
    company: "Google",
    role_level: "junior",
    hints: ["Compare the current nodes of both lists", "Always pick the smaller value and advance that list", "Use a dummy head to simplify edge cases"],
    solution_approach: "Use a dummy node. Compare heads of both lists, append smaller one, advance that pointer. Handle remaining nodes.",
    test_cases: [], starter_code: {}, tags: ["linked-list", "recursion"]
  },
  {
    title: "Climbing Stairs",
    statement: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    category: "Dynamic Programming",
    difficulty_elo: 1100,
    field: "software_engineering",
    company: "Amazon",
    role_level: "junior",
    hints: ["Think about how you can reach step n", "You can reach step n from step n-1 or step n-2", "This is similar to the Fibonacci sequence"],
    solution_approach: "DP solution: ways(n) = ways(n-1) + ways(n-2). Base cases: ways(1)=1, ways(2)=2.",
    test_cases: [], starter_code: {}, tags: ["dynamic-programming", "math"]
  },
  {
    title: "Best Time to Buy and Sell Stock",
    statement: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy and a different day in the future to sell. Return the maximum profit you can achieve. If you cannot achieve any profit, return 0.",
    category: "Arrays",
    difficulty_elo: 1050,
    field: "software_engineering",
    company: "Bloomberg",
    role_level: "junior",
    hints: ["You need to buy before you sell", "Track the minimum price seen so far", "At each day, calculate potential profit if you sell today"],
    solution_approach: "One pass: track minimum price and maximum profit. For each price, update min and check if current profit is better.",
    test_cases: [], starter_code: {}, tags: ["array", "greedy"]
  },
  {
    title: "Contains Duplicate",
    statement: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    category: "Arrays",
    difficulty_elo: 950,
    field: "software_engineering",
    company: "Apple",
    role_level: "junior",
    hints: ["What data structure allows O(1) lookup?", "A Set automatically handles duplicates", "Compare the length of the set with the original array"],
    solution_approach: "Use a Set to store seen values. If a value is already in the set, return true.",
    test_cases: [], starter_code: {}, tags: ["array", "hash-table"]
  },
  {
    title: "Fibonacci Number",
    statement: "The Fibonacci numbers form a sequence where each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).",
    category: "Dynamic Programming",
    difficulty_elo: 950,
    field: "software_engineering",
    company: "Microsoft",
    role_level: "junior",
    hints: ["F(0) = 0, F(1) = 1", "F(n) = F(n-1) + F(n-2)", "You can solve this iteratively to avoid stack overflow"],
    solution_approach: "Iterative: start with 0, 1 and compute next values. Or use memoization with recursion.",
    test_cases: [], starter_code: {}, tags: ["dynamic-programming", "math", "recursion"]
  },
  {
    title: "Palindrome Number",
    statement: "Given an integer x, return true if x is a palindrome, and false otherwise. A palindrome is a number that reads the same backward as forward.",
    category: "Math",
    difficulty_elo: 1000,
    field: "software_engineering",
    company: "Google",
    role_level: "junior",
    hints: ["Negative numbers cannot be palindromes", "You could convert to string and compare", "Or reverse the number mathematically and compare"],
    solution_approach: "Convert to string and check if it equals its reverse. Or reverse half the number and compare.",
    test_cases: [], starter_code: {}, tags: ["math"]
  },
  {
    title: "Longest Common Prefix",
    statement: "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.",
    category: "Strings",
    difficulty_elo: 1050,
    field: "software_engineering",
    company: "Facebook",
    role_level: "junior",
    hints: ["Compare characters at each position across all strings", "Stop when you find a mismatch or reach the end of any string", "You could also sort the strings and compare first and last"],
    solution_approach: "Vertical scanning: compare character by character across all strings until mismatch.",
    test_cases: [], starter_code: {}, tags: ["string", "trie"]
  },
  {
    title: "Remove Duplicates from Sorted Array",
    statement: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. Return the number of unique elements.",
    category: "Arrays",
    difficulty_elo: 1000,
    field: "software_engineering",
    company: "Amazon",
    role_level: "junior",
    hints: ["Use two pointers - one for reading, one for writing", "The array is sorted, so duplicates are adjacent", "Only write when you see a new value"],
    solution_approach: "Two pointers: slow pointer for unique elements, fast pointer for scanning. Move unique elements to front.",
    test_cases: [], starter_code: {}, tags: ["array", "two-pointers"]
  },
  {
    title: "Search Insert Position",
    statement: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.",
    category: "Binary Search",
    difficulty_elo: 1000,
    field: "software_engineering",
    company: "Google",
    role_level: "junior",
    hints: ["This is a variation of binary search", "If target not found, the insert position is where left pointer ends up", "Think about what happens when left > right"],
    solution_approach: "Binary search. If not found, return left pointer which points to insertion position.",
    test_cases: [], starter_code: {}, tags: ["binary-search", "array"]
  },
  {
    title: "Maximum Depth of Binary Tree",
    statement: "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    category: "Trees",
    difficulty_elo: 1100,
    field: "software_engineering",
    company: "Microsoft",
    role_level: "junior",
    hints: ["Think recursively - depth is 1 + max of children depths", "Base case: empty tree has depth 0", "You can also solve this with BFS level by level"],
    solution_approach: "Recursive: return 1 + max(depth(left), depth(right)). Base case: null node returns 0.",
    test_cases: [], starter_code: {}, tags: ["tree", "dfs", "bfs", "recursion"]
  }
];

export async function POST() {
  try {
    // Check existing problems
    const { data: existingProblems } = await supabaseAdmin
      .from("problems")
      .select("title");
    
    const existingTitles = new Set((existingProblems || []).map(p => p.title));
    
    // Filter out problems that already exist
    const newProblems = CODING_PROBLEMS.filter(p => !existingTitles.has(p.title));
    
    if (newProblems.length === 0) {
      return NextResponse.json({ 
        message: "All problems already exist in database",
        count: 0 
      });
    }
    
    // Insert new problems
    const { data, error } = await supabaseAdmin
      .from("problems")
      .insert(newProblems)
      .select();
    
    if (error) {
      console.error("Error seeding problems:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: `Successfully added ${data.length} new problems`,
      count: data.length,
      problems: data.map(p => p.title)
    });
  } catch (err) {
    console.error("Seed problems error:", err);
    return NextResponse.json({ error: "Failed to seed problems" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: problems, error } = await supabaseAdmin
      .from("problems")
      .select("id, title, category, difficulty_elo")
      .order("difficulty_elo");
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      count: problems?.length || 0,
      problems 
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}


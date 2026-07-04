"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useExecutionStore } from "@/store/useExecutionStore";
import { useAuthStore } from "@/store/useAuthStore";
import Timeline from "@/components/Timeline";
import VariableInspector from "@/components/VariableInspector";
import CallStackView from "@/components/CallStackView";
import ConsolePanel from "@/components/ConsolePanel";
import VisualizationCanvas from "@/components/VisualizationCanvas";
import AuthModal from "@/components/AuthModal";
import SessionsPanel from "@/components/SessionsPanel";
import AskJarsPanel from "@/components/AskJarsPanel";

// Monaco touches window/navigator — must load client-side only.
const CodeEditor = dynamic(() => import("@/components/CodeEditor"), { ssr: false });

const EXAMPLES: Record<string, string> = {
  "Recursive Fibonacci": `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

let result = fib(6);
console.log("fib(6) =", result);`,
  "Bubble Sort": `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}

let sorted = bubbleSort([5, 2, 8, 1, 9, 3]);
console.log("sorted:", sorted);`,
  "Two Sum (Hash Map)": `function twoSum(nums, target) {
  let seen = {};
  for (let i = 0; i < nums.length; i++) {
    let complement = target - nums[i];
    if (seen[complement] !== undefined) {
      return [seen[complement], i];
    }
    seen[nums[i]] = i;
  }
  return [];
}

let res = twoSum([2, 7, 11, 15], 9);
console.log("two sum:", res);`,
  "Unique Paths (DP Table)": `function uniquePaths(m, n) {
  let dp = [];
  for (let i = 0; i < m; i++) {
    let row = [];
    for (let j = 0; j < n; j++) {
      row.push(0);
    }
    dp.push(row);
  }
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (i === 0 || j === 0) {
        dp[i][j] = 1;
      } else {
        dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
      }
    }
  }
  return dp[m - 1][n - 1];
}

let result = uniquePaths(3, 3);
console.log("uniquePaths:", result);`,
  "Build Linked List": `function buildList(values) {
  let head = null;
  let tail = null;
  for (let i = 0; i < values.length; i++) {
    let node = { value: values[i], next: null };
    if (head === null) {
      head = node;
      tail = node;
    } else {
      tail.next = node;
      tail = node;
    }
  }
  return head;
}

let list = buildList([1, 2, 3, 4]);
console.log("list built");`,
  "Binary Search Tree Insert": `function insert(root, value) {
  if (root === null) {
    return { value: value, left: null, right: null };
  }
  if (value < root.value) {
    root.left = insert(root.left, value);
  } else {
    root.right = insert(root.right, value);
  }
  return root;
}

let root = null;
let values = [5, 3, 8, 1, 4];
for (let i = 0; i < values.length; i++) {
  root = insert(root, values[i]);
}
console.log("tree built");`,
  "Graph BFS": `function bfs(graph, start) {
  let visited = {};
  let queue = [start];
  let order = [];
  visited[start] = true;
  while (queue.length > 0) {
    let node = queue.shift();
    order.push(node);
    let neighbors = graph[node];
    for (let i = 0; i < neighbors.length; i++) {
      let next = neighbors[i];
      if (!visited[next]) {
        visited[next] = true;
        queue.push(next);
      }
    }
  }
  return order;
}

let graph = { A: ["B", "C"], B: ["A", "D"], C: ["A", "D"], D: ["B", "C"] };
let result = bfs(graph, "A");
console.log("bfs order:", result);`,
};

export default function VisualizerPage() {
  const code = useExecutionStore((s) => s.code);
  const setCode = useExecutionStore((s) => s.setCode);
  const runCode = useExecutionStore((s) => s.runCode);

  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [authOpen, setAuthOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  useEffect(() => {
    if (!code) setCode(EXAMPLES["Recursive Fibonacci"]);
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen relative z-10">
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {sessionsOpen && <SessionsPanel onClose={() => setSessionsOpen(false)} />}

      <nav className="border-b border-border-soft sticky top-0 z-20 backdrop-blur-lg bg-bg/70">
        <div className="max-w-[1180px] mx-auto px-7 pt-4 flex items-center justify-between gap-4">
          <Link href="/" className="font-display font-bold text-lg flex items-center gap-2 shrink-0">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo to-purple flex items-center justify-center text-xs font-mono font-semibold">
              J
            </span>
            JARS
          </Link>

          {user ? (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setSessionsOpen(true)}
                className="font-mono text-[0.72rem] px-3 py-1.5 rounded-md border border-border bg-surface-2 text-ink-dim hover:text-ink hover:border-indigo transition"
              >
                My Sessions
              </button>
              <span className="text-xs text-ink-faint font-mono hidden sm:inline">{user.email}</span>
              <button onClick={logout} className="text-xs text-ink-faint hover:text-coral transition">
                Log out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="font-semibold text-sm px-4 py-1.5 rounded-lg bg-surface-2 border border-border hover:border-indigo transition shrink-0"
            >
              Sign in
            </button>
          )}
        </div>
        <div className="max-w-[1180px] mx-auto px-7 py-3 flex items-center gap-2 flex-wrap">
          {Object.keys(EXAMPLES).map((name) => (
            <button
              key={name}
              onClick={() => setCode(EXAMPLES[name])}
              className="font-mono text-[0.72rem] px-3 py-1.5 rounded-md border border-border bg-surface-2 text-ink-dim hover:text-ink hover:border-indigo transition"
            >
              {name}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-[1180px] mx-auto px-7 py-8">
        <div className="rounded-2xl border border-border bg-gradient-to-b from-surface to-bg-2 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-soft">
            <div className="font-mono text-xs text-ink-faint">solution.js</div>
            <button
              onClick={runCode}
              className="font-sans font-semibold text-sm px-5 py-2 rounded-lg bg-gradient-to-br from-indigo to-[#8f6bff] text-white shadow-lg shadow-indigo/30 hover:-translate-y-0.5 transition"
            >
              ▶ Run &amp; Visualize
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-r border-border-soft h-[600px]">
              <CodeEditor />
            </div>
            <div className="flex flex-col h-[600px]">
              <div className="flex-1 overflow-auto border-b border-border-soft bg-bg-2/40 flex">
                <VisualizationCanvas />
              </div>
              <div className="p-4 flex flex-col gap-3 overflow-auto max-h-[280px]">
                <ConsolePanel />
                <div className="flex gap-3 flex-wrap">
                  <VariableInspector />
                  <CallStackView />
                </div>
                <AskJarsPanel />
              </div>
            </div>
          </div>

          <Timeline />
        </div>

        <p className="text-center text-ink-faint font-mono text-xs mt-6">
          This engine really parses and executes your code with @babel/parser — try editing it and hitting Run.
        </p>
      </div>
    </main>
  );
}

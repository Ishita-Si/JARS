import Link from "next/link";

const patterns = [
  "Recursion", "Dynamic Programming", "Memoization", "Binary Search", "DFS", "BFS",
  "Tree Traversal", "Graph Traversal", "Linked Lists", "Stacks & Queues", "Hash Maps",
  "Sliding Window", "Two Pointers", "Divide & Conquer", "Heaps", "Sorting",
];

export default function Home() {
  return (
    <main className="min-h-screen relative z-10">
      <nav className="sticky top-0 z-20 backdrop-blur-lg bg-bg/70 border-b border-border-soft">
        <div className="max-w-[1180px] mx-auto px-7 py-4 flex items-center justify-between">
          <div className="font-display font-bold text-lg flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo to-purple flex items-center justify-center text-xs font-mono font-semibold">
              J
            </span>
            JARS
          </div>
          <Link
            href="/visualizer"
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-surface-2 border border-border hover:border-indigo transition"
          >
            Try JARS →
          </Link>
        </div>
      </nav>

      <header className="text-center pt-24 pb-16 px-7">
        <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan bg-cyan/10 border border-cyan/25 rounded-full px-4 py-1.5 mb-6">
          Runtime Visualization Engine
        </div>
        <h1 className="font-display font-bold text-5xl md:text-6xl leading-tight mb-5">
          Watch your code
          <br />
          <span className="bg-gradient-to-r from-indigo via-purple to-cyan bg-clip-text text-transparent">
            think.
          </span>
        </h1>
        <p className="max-w-xl mx-auto text-ink-dim text-lg mb-8">
          Paste code from anywhere. JARS detects the algorithm automatically and turns every
          step of its execution into a synchronized, interactive trace.
        </p>
        <Link
          href="/visualizer"
          className="inline-block font-semibold px-6 py-3 rounded-lg bg-gradient-to-br from-indigo to-[#8f6bff] text-white shadow-lg shadow-indigo/30 hover:-translate-y-0.5 transition"
        >
          Try the live demo
        </Link>
      </header>

      <section className="max-w-[1180px] mx-auto px-7 py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-indigo mb-3">
            Automatic Pattern Detection
          </div>
          <h2 className="font-display font-semibold text-3xl mb-3">No manual algorithm selection.</h2>
          <p className="text-ink-dim">JARS reads the structure of your code and adapts the interface to match.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {patterns.map((p) => (
            <div
              key={p}
              className="bg-surface border border-border-soft rounded-lg px-4 py-3.5 text-sm text-ink-dim hover:text-ink hover:border-indigo transition"
            >
              {p}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border-soft py-10">
        <div className="max-w-[1180px] mx-auto px-7 font-mono text-xs text-ink-faint">
          JARS — Code, Visualized.
        </div>
      </footer>
    </main>
  );
}

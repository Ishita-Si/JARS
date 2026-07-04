# JARS — Code, Visualized.

A runtime visualization engine: paste JS/TS code, it actually parses and
executes it, and traces every step for playback in the browser.

This is a real, working milestone — not a mockup. The interpreter in
`frontend/lib/interpreter/` genuinely runs arbitrary code (recursion, loops,
arrays, objects, closures) via a hand-written tree-walking evaluator over a
Babel AST. It has been tested against recursive Fibonacci, bubble sort, and
a hash-map two-sum solution, plus an infinite-loop guard.

## What's real vs. what's next

**Working now:**
- Tree-walking interpreter for a practical JS/TS subset (see "Supported
  language features" below), with a full execution trace (variables, call
  stack, console output, line numbers) recorded at every step
- Heuristic pattern detector (recursion, nested loops, binary search, two
  pointers, hash map, sorting) that scans the AST
- Next.js frontend: Monaco editor synced to the current execution line,
  a live visualization canvas, variable inspector, call stack view,
  console panel, and a real play / pause / step / scrub timeline — all
  driven by the actual trace, not canned animations
- **Seven canvas visualizations, all driven by real scope data — none of
  them are hardcoded per algorithm:**
  - **Recursion tree** — reconstructed from `call`/`return` steps.
    Verified against `fib(4)`: correct nesting, correct return values,
    correct pending/active/done status at any scrub position. Click any
    node to jump the timeline there.
  - **Array canvas** — auto-detects arrays in scope plus index-like
    pointer variables (`low`/`high`/`mid`, `i`/`j`, `left`/`right`, ...),
    diffs cells against the previous step to highlight changes.
  - **Hash map canvas** — auto-detects object variables (excluding
    linked-list/tree/graph shapes, so it doesn't double-render those) and
    highlights newly-added keys.
  - **DP table canvas** — auto-detects 2D arrays and renders them as a
    grid, highlighting cells that changed since the previous step.
    Verified against `uniquePaths(3,3)`, which correctly computes 6 and
    shows the grid filling in step by step.
  - **Linked list canvas** — auto-detects `{value/val, next}`-shaped
    objects and walks the `next` chain (cycle-guarded) into a connected
    row of boxes. Verified building `[1,2,3,4]` from scratch.
  - **Binary tree canvas** — auto-detects `{value/val, left, right}`
    objects and renders the recursive structure. Verified against a BST
    built from `[5,3,8,1,4]` — correct shape confirmed node-by-node.
  - **Graph canvas** — auto-detects adjacency-list objects
    (`{A: [...], B: [...]}`) and highlights nodes present in a
    companion `visited`/`seen` set. Verified against a BFS trace.
  - A `VisualizationCanvas` switcher shows whichever of these apply to
    the current scope simultaneously (e.g. two-sum shows the array *and*
    the hash map at once).
- **Full-stack wiring, tested end-to-end:**
  - FastAPI backend: JWT auth (signup/login/me), session persistence
    (SQLite via SQLModel), and an AI insights endpoint wired to the
    Claude API
  - Frontend `lib/api.ts` + `store/useAuthStore.ts` talk to it for real:
    sign in/up (`AuthModal`), save/list/load/delete visualizations
    (`SessionsPanel`), and an "Ask JARS" box (`AskJarsPanel`) that sends
    the current code + scrubbed-to variable state as context and shows a
    clear message if `GEMINI_API_KEY` isn't configured yet (503)

**Not built yet:**
- Other languages (Python, C++, Java, Go, Rust...) — the architecture
  (AST → intermediate trace) is language-agnostic by design, so adding a
  language means writing a new interpreter against the same `TraceStep`
  shape, not rearchitecting
- Tries, heaps/priority queues, segment trees, union-find as dedicated
  canvases — same `find*` + diff pattern as the ones above would extend
  to them
- Classes, try/catch, destructuring, for-of/for-in, generators, async/await
- Force-directed / non-adjacency-list graph layouts (the current graph
  canvas is a simple node-list-with-neighbors view, not a node-edge
  diagram — good enough to follow BFS/DFS order, not a general graph
  drawing tool)

## Project structure

```
jars/
  frontend/           Next.js 14 + TypeScript + Tailwind + Framer Motion + Zustand
    app/
      page.tsx              landing page
      visualizer/page.tsx   the live editor + execution viewer
    components/
      CodeEditor.tsx, Timeline.tsx, VariableInspector.tsx, CallStackView.tsx, ConsolePanel.tsx
      VisualizationCanvas.tsx   switches between / stacks the canvases below
      RecursionTree.tsx, ArrayCanvas.tsx, HashMapCanvas.tsx
      DPTableCanvas.tsx, LinkedListCanvas.tsx, TreeCanvas.tsx, GraphCanvas.tsx
      AuthModal.tsx, SessionsPanel.tsx, AskJarsPanel.tsx
    lib/interpreter/
      interpreter.ts         the tree-walking interpreter (the core engine)
      environment.ts          scope chain / closures
      detectPattern.ts        heuristic pattern detection
      types.ts                shared trace types
    lib/visualization/
      buildRecursionTree.ts   reconstructs the call tree from call/return steps
      deriveStructures.ts     detects DP tables / linked lists / trees / graphs in scope
    lib/api.ts                typed fetch client for the backend
    store/
      useExecutionStore.ts    runs the interpreter, drives playback
      useAuthStore.ts         JWT session, persisted to localStorage

  backend/            FastAPI
    main.py
    models.py / schemas.py / database.py
    auth_utils.py
    routers/
      auth.py         signup / login / me (JWT)
      sessions.py      save / list / get / delete visualizations
      insights.py      AI runtime explanations (API)
```

## Running it locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — the landing page links to `/visualizer`,
where you can pick an example or paste your own JS/TS and hit **Run &
Visualize**. Copy `.env.example` to `.env.local` if your backend isn't
running on the default `http://localhost:8000`.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp example.env .env      # then fill in JWT_SECRET and (optionally) GEMINI_API_KEY
uvicorn main:app --reload
```

API docs at http://localhost:8000/docs. With both servers running, sign
up from the "Sign in" button in the visualizer nav, then use "My
Sessions" to save/load code and "Ask JARS" (under the console panel) to
query the AI insights endpoint — it'll tell you plainly if
`GEMINI_API_KEY` isn't set yet rather than failing silently.

## Supported language features (interpreter)

Variables (`var`/`let`/`const`), function declarations/expressions/arrows,
recursion, `if`/`else`, `for`, `while`, `break`/`continue`, arrays,
objects, member access (`obj.x`, `arr[i]`), most operators, template
literals, common array methods (`push`, `map`, `filter`, `reduce`,
`sort`, ...), and `console.log`. Unsupported constructs raise a clear
`InterpreterError` naming the unsupported node type rather than failing
silently.

/**
 * Dependency graph helpers for the PM layer.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Dependency-Graph.md §3
 *
 * Operations on edges of the form { from_task_id → to_task_id } where
 * "from" is the predecessor (must finish first) and "to" is the successor.
 */

export interface PmEdge {
  from: string;
  to: string;
  /** Optional duration metadata used by critical-path; default 1. */
  weight?: number;
}

export class CycleError extends Error {
  readonly path: string[];
  constructor(path: string[]) {
    super(`Adding this dependency would create a cycle: ${path.join(' → ')}`);
    this.name = 'CycleError';
    this.path = path;
  }
}

/** Build adjacency map: predecessor → successors[]. */
export function buildAdjacency(edges: readonly PmEdge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }
  return adj;
}

/**
 * Returns true when adding edge `(from → to)` to the existing edge set
 * would introduce a cycle. Detects via DFS from `to` looking for `from`.
 */
export function wouldCreateCycle(
  edges: readonly PmEdge[],
  from: string,
  to: string,
): { cycle: true; path: string[] } | { cycle: false } {
  if (from === to) return { cycle: true, path: [from, to] };
  const adj = buildAdjacency(edges);
  const stack: { node: string; path: string[] }[] = [{ node: to, path: [from, to] }];
  const visited = new Set<string>();
  while (stack.length) {
    const cur = stack.pop()!;
    if (visited.has(cur.node)) continue;
    visited.add(cur.node);
    const next = adj.get(cur.node) ?? [];
    for (const n of next) {
      const path = [...cur.path, n];
      if (n === from) return { cycle: true, path };
      stack.push({ node: n, path });
    }
  }
  return { cycle: false };
}

/** Throws CycleError if edge would create a cycle; otherwise no-op. */
export function assertAcyclic(
  edges: readonly PmEdge[],
  from: string,
  to: string,
): void {
  const r = wouldCreateCycle(edges, from, to);
  if (r.cycle) throw new CycleError(r.path);
}

/**
 * Kahn's topological sort. Returns ordered node ids; throws if a cycle
 * exists in the input (defensive — callers should keep the graph acyclic).
 */
export function topoSort(nodes: readonly string[], edges: readonly PmEdge[]): string[] {
  const indeg = new Map<string, number>();
  nodes.forEach(n => indeg.set(n, 0));
  for (const e of edges) {
    if (!indeg.has(e.from)) indeg.set(e.from, 0);
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
  }
  const queue: string[] = [];
  indeg.forEach((v, k) => v === 0 && queue.push(k));
  const adj = buildAdjacency(edges);
  const out: string[] = [];
  while (queue.length) {
    const n = queue.shift()!;
    out.push(n);
    for (const m of adj.get(n) ?? []) {
      indeg.set(m, (indeg.get(m) ?? 0) - 1);
      if (indeg.get(m) === 0) queue.push(m);
    }
  }
  if (out.length < indeg.size) {
    throw new CycleError([]);
  }
  return out;
}

/**
 * Critical path: longest weighted path through the DAG. Returns the set of
 * node ids on the critical path plus its total length.
 */
export function criticalPath(
  nodes: readonly string[],
  edges: readonly PmEdge[],
): { nodes: Set<string>; length: number } {
  const order = topoSort(nodes, edges);
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  for (const n of order) {
    dist.set(n, 0);
    prev.set(n, null);
  }
  const adj = buildAdjacency(edges);
  const wMap = new Map<string, number>();
  for (const e of edges) wMap.set(`${e.from}→${e.to}`, e.weight ?? 1);

  for (const n of order) {
    const d = dist.get(n)!;
    for (const m of adj.get(n) ?? []) {
      const w = wMap.get(`${n}→${m}`) ?? 1;
      if (d + w > (dist.get(m) ?? 0)) {
        dist.set(m, d + w);
        prev.set(m, n);
      }
    }
  }
  // Find sink with max dist
  let sink: string | null = null;
  let max = -1;
  dist.forEach((v, k) => {
    if (v > max) {
      max = v;
      sink = k;
    }
  });
  const path = new Set<string>();
  let cur: string | null = sink;
  while (cur) {
    path.add(cur);
    cur = prev.get(cur) ?? null;
  }
  return { nodes: path, length: max < 0 ? 0 : max };
}

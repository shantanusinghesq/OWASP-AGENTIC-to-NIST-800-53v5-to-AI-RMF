/**
 * cascade-graph — Pure Cascade Topology Layout
 *
 * Derives a node-link failure-propagation graph (with timeline steps) from a
 * FactPattern + ScenarioResult. Pure layout logic — no React, no state.
 * Rendered by CascadeGraph.tsx; invoked from ScenarioContext's useMemo.
 */

import type { FactPattern, ScenarioResult } from "./types";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CascadeNode {
  id: string;
  label: string;
  type: "coordinator" | "agent" | "risk" | "control";
  x: number;
  y: number;
  failed: boolean;
  failedAt?: number; // timeline step
}

export interface CascadeEdge {
  source: string;
  target: string;
  type: "command" | "peer" | "propagation";
  activatedAt?: number; // timeline step
  label?: string;
}

export interface CascadeGraph {
  nodes: CascadeNode[];
  edges: CascadeEdge[];
  totalSteps: number;
}

// ─── Cascade Graph Generator ────────────────────────────────────────────────

export function generateCascadeGraph(fp: FactPattern, result: ScenarioResult): CascadeGraph {
  const { agent_archetype } = fp;
  const brokenFamilies = Array.from(
    new Set(result.controls_evaluated.filter(c => c.state === "broken").map(c => c.family))
  );

  const nodes: CascadeNode[] = [];
  const edges: CascadeEdge[] = [];
  let totalSteps = 1;

  // Layout constants
  const cx = 250;
  const cy = 200;
  const radius = 140;

  switch (agent_archetype) {
    case "Single": {
      nodes.push({ id: "agent-a", label: "Agent", type: "agent", x: cx, y: cy, failed: brokenFamilies.length > 0, failedAt: 1 });
      brokenFamilies.forEach((fam, i) => {
        const angle = (i / Math.max(brokenFamilies.length, 1)) * Math.PI * 2 - Math.PI / 2;
        nodes.push({
          id: `risk-${fam}`, label: fam, type: "control", x: cx + Math.cos(angle) * 100, y: cy + Math.sin(angle) * 100, failed: true, failedAt: 2,
        });
        edges.push({ source: "agent-a", target: `risk-${fam}`, type: "propagation", activatedAt: 1 });
      });
      totalSteps = 2;
      break;
    }
    case "Sequential": {
      const agents = ["Agent A", "Agent B", "Agent C"];
      agents.forEach((label, i) => {
        const x = 80 + i * 170;
        nodes.push({ id: `agent-${i}`, label, type: "agent", x, y: cy, failed: i > 0 && brokenFamilies.length > 0, failedAt: i + 1 });
        if (i > 0) edges.push({ source: `agent-${i - 1}`, target: `agent-${i}`, type: "command", activatedAt: i });
      });
      // Add risk nodes below the chain
      brokenFamilies.slice(0, 4).forEach((fam, i) => {
        nodes.push({ id: `risk-${fam}`, label: fam, type: "control", x: 80 + i * 130, y: cy + 120, failed: true, failedAt: 3 });
        edges.push({ source: "agent-2", target: `risk-${fam}`, type: "propagation", activatedAt: 3 });
      });
      totalSteps = 4;
      break;
    }
    case "Supervisor": {
      nodes.push({ id: "supervisor", label: "Supervisor", type: "coordinator", x: cx, y: 80, failed: false, failedAt: undefined });
      const subAgents = ["Agent A", "Agent B", "Agent C"];
      subAgents.forEach((label, i) => {
        const angle = ((i + 0.5) / subAgents.length) * Math.PI + Math.PI * 0.1;
        const x = cx + Math.cos(angle) * radius;
        const y = 80 + Math.sin(angle) * radius;
        const isFailed = i < brokenFamilies.length;
        nodes.push({ id: `agent-${i}`, label, type: "agent", x, y, failed: isFailed, failedAt: isFailed ? i + 2 : undefined });
        edges.push({ source: "supervisor", target: `agent-${i}`, type: "command", activatedAt: 1 });
      });
      // Risk propagation from failed agents
      brokenFamilies.slice(0, 3).forEach((fam, i) => {
        nodes.push({ id: `risk-${fam}`, label: fam, type: "control", x: 80 + i * 150, y: cy + 140, failed: true, failedAt: 4 });
        edges.push({ source: `agent-${i}`, target: `risk-${fam}`, type: "propagation", activatedAt: 3 });
      });
      totalSteps = 5;
      break;
    }
    case "Swarm": {
      // Coordinator at center
      nodes.push({ id: "coordinator", label: "Coordinator", type: "coordinator", x: cx, y: cy, failed: brokenFamilies.length > 3, failedAt: brokenFamilies.length > 3 ? 5 : undefined });
      // Swarm agents in a hexagonal ring
      const swarmAgents = ["Agent A", "Agent B", "Agent C", "Agent D", "Agent E", "Agent F"];
      swarmAgents.forEach((label, i) => {
        const angle = (i / swarmAgents.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const isFailed = i < Math.min(brokenFamilies.length, 4);
        nodes.push({ id: `agent-${i}`, label, type: "agent", x, y, failed: isFailed, failedAt: isFailed ? i + 1 : undefined });
        // Peer connections (mesh)
        if (i > 0) edges.push({ source: `agent-${i - 1}`, target: `agent-${i}`, type: "peer", activatedAt: Math.ceil(i / 2) });
        edges.push({ source: "coordinator", target: `agent-${i}`, type: "command", activatedAt: 1 });
      });
      // Close the ring
      edges.push({ source: `agent-${swarmAgents.length - 1}`, target: "agent-0", type: "peer", activatedAt: 3 });
      // Cross connections for mesh
      edges.push({ source: "agent-0", target: "agent-3", type: "peer", activatedAt: 2 });
      edges.push({ source: "agent-1", target: "agent-4", type: "peer", activatedAt: 3 });
      edges.push({ source: "agent-2", target: "agent-5", type: "peer", activatedAt: 4 });
      totalSteps = 6;
      break;
    }
  }

  return { nodes, edges, totalSteps };
}

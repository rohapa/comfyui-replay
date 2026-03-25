#!/usr/bin/env node

/**
 * ComfyUI Workflow Replay Script Generator
 *
 * Reads a ComfyUI workflow JSON file and generates a JavaScript snippet
 * you can paste into your browser console to visually rebuild the workflow
 * node-by-node with timed delays — perfect for screen recording tutorials.
 *
 * Usage:
 *   node workflow-replay.js <workflow.json> [--delay 800] [--output replay.js]
 *
 * Options:
 *   --delay <ms>    Delay between each step in milliseconds (default: 800)
 *   --output <file> Write the generated script to a file instead of stdout
 *   --no-values     Skip setting widget values (just show nodes + connections)
 *   --layout        Auto-layout nodes left-to-right in build order
 */

const fs = require("fs");
const path = require("path");

// ─── CLI Args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let inputFile = null;
let delay = 800;
let outputFile = null;
let skipValues = false;
let autoLayout = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--delay" && args[i + 1]) {
    delay = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === "--output" && args[i + 1]) {
    outputFile = args[i + 1];
    i++;
  } else if (args[i] === "--no-values") {
    skipValues = true;
  } else if (args[i] === "--layout") {
    autoLayout = true;
  } else if (!args[i].startsWith("--")) {
    inputFile = args[i];
  }
}

if (!inputFile) {
  console.error(`
╔══════════════════════════════════════════════════════════════╗
║  ComfyUI Workflow Replay Script Generator                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Usage:                                                      ║
║    node workflow-replay.js <workflow.json> [options]          ║
║                                                              ║
║  Options:                                                    ║
║    --delay <ms>     Delay between steps (default: 800)       ║
║    --output <file>  Write script to file instead of stdout   ║
║    --no-values      Skip setting widget values               ║
║    --layout         Auto-layout nodes in build order         ║
║                                                              ║
║  Example:                                                    ║
║    node workflow-replay.js my_workflow.json --delay 1000     ║
║    node workflow-replay.js my_workflow.json --output replay  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

// ─── Parse Workflow ────────────────────────────────────────────────────────────

const raw = fs.readFileSync(path.resolve(inputFile), "utf-8");
const workflow = JSON.parse(raw);

// ComfyUI workflow JSON has two main structures:
// 1. "nodes" array — each node has id, type, pos, size, widgets_values, inputs, outputs
// 2. "links" array — each link is [linkId, sourceNodeId, sourceSlot, targetNodeId, targetSlot, type]

const nodes = workflow.nodes || [];
const links = workflow.links || [];

if (nodes.length === 0) {
  console.error("Error: No nodes found in workflow JSON.");
  process.exit(1);
}

// ─── Build Dependency Graph & Topological Sort ─────────────────────────────────

// Map node IDs to node objects
const nodeMap = new Map();
nodes.forEach((n) => nodeMap.set(n.id, n));

// Build adjacency for topo sort (edges: dependency → dependent)
const inDegree = new Map();
const adjacency = new Map();

nodes.forEach((n) => {
  inDegree.set(n.id, 0);
  adjacency.set(n.id, []);
});

// links format: [linkId, sourceNodeId, sourceSlot, targetNodeId, targetSlot, type]
links.forEach((link) => {
  const [, srcId, , tgtId] = link;
  if (nodeMap.has(srcId) && nodeMap.has(tgtId)) {
    adjacency.get(srcId).push(tgtId);
    inDegree.set(tgtId, (inDegree.get(tgtId) || 0) + 1);
  }
});

// Kahn's algorithm for topological sort
const queue = [];
inDegree.forEach((deg, id) => {
  if (deg === 0) queue.push(id);
});

const sorted = [];
while (queue.length > 0) {
  // Sort by node position (left-to-right, top-to-bottom) for visual order
  queue.sort((a, b) => {
    const na = nodeMap.get(a);
    const nb = nodeMap.get(b);
    const posA = na.pos || [0, 0];
    const posB = nb.pos || [0, 0];
    return posA[0] - posB[0] || posA[1] - posB[1];
  });

  const current = queue.shift();
  sorted.push(current);

  for (const neighbor of adjacency.get(current) || []) {
    inDegree.set(neighbor, inDegree.get(neighbor) - 1);
    if (inDegree.get(neighbor) === 0) {
      queue.push(neighbor);
    }
  }
}

// Handle any remaining nodes (cycles or disconnected)
nodes.forEach((n) => {
  if (!sorted.includes(n.id)) {
    sorted.push(n.id);
  }
});

// ─── Build Connection Map ──────────────────────────────────────────────────────

// Group links by target node so we connect each node's inputs after it's created
// We also need to know which nodes need to exist before we can make a connection
const connectionsByTarget = new Map();
links.forEach((link) => {
  const [linkId, srcId, srcSlot, tgtId, tgtSlot, linkType] = link;
  if (!connectionsByTarget.has(tgtId)) {
    connectionsByTarget.set(tgtId, []);
  }
  connectionsByTarget.get(tgtId).push({
    linkId,
    srcId,
    srcSlot,
    tgtId,
    tgtSlot,
    linkType,
  });
});

// ─── Generate JavaScript ───────────────────────────────────────────────────────

const steps = [];
let stepIndex = 0;

// Preamble
steps.push(`
// ═══════════════════════════════════════════════════════════════
// ComfyUI Workflow Replay Script
// Generated from: ${path.basename(inputFile)}
// Nodes: ${nodes.length} | Links: ${links.length} | Delay: ${delay}ms
// ═══════════════════════════════════════════════════════════════
//
// HOW TO USE:
// 1. Open ComfyUI in your browser
// 2. Clear the canvas (select all → delete, or Ctrl+A → Delete)
// 3. Open the browser console (F12 → Console tab)
// 4. Paste this entire script and press Enter
// 5. Start your screen recording!
// 6. The workflow will build itself step-by-step
//
// To stop the replay early, run: window.__replayStop = true;
// ═══════════════════════════════════════════════════════════════

(async function replayWorkflow() {
  const DELAY = ${delay};
  const nodeRefs = {}; // Maps original node ID → LiteGraph node reference
  window.__replayStop = false;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function log(step, total, msg) {
    console.log(\`%c[Step \${step}/\${total}] \${msg}\`, 'color: #00d4ff; font-weight: bold;');
  }

  const totalSteps = ${sorted.length + links.length};
  let currentStep = 0;

  // Clear the canvas
  log(0, totalSteps, '🧹 Clearing canvas...');
  app.graph.clear();
  await sleep(DELAY);
`);

// Generate node creation steps in topological order
sorted.forEach((nodeId, idx) => {
  const node = nodeMap.get(nodeId);
  if (!node) return;

  const nodeType = node.type;
  const pos = node.pos || [100 + idx * 300, 100];
  const size = node.size || [200, 150];
  const title = node.title || nodeType;

  // Use auto-layout or original positions
  let posX, posY;
  if (autoLayout) {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    posX = 80 + col * 350;
    posY = 80 + row * 300;
  } else {
    posX = Array.isArray(pos) ? pos[0] : pos.x || 100;
    posY = Array.isArray(pos) ? pos[1] : pos.y || 100;
  }

  stepIndex++;

  let widgetCode = "";
  if (!skipValues && node.widgets_values && node.widgets_values.length > 0) {
    const safeValues = JSON.stringify(node.widgets_values);
    widgetCode = `
    // Set widget values
    if (n.widgets && n.widgets.length > 0) {
      const vals = ${safeValues};
      for (let i = 0; i < Math.min(n.widgets.length, vals.length); i++) {
        if (vals[i] !== null && vals[i] !== undefined) {
          n.widgets[i].value = vals[i];
        }
      }
    }`;
  }

  // Handle node properties
  let propsCode = "";
  if (node.properties && Object.keys(node.properties).length > 0) {
    const safeProps = JSON.stringify(node.properties);
    propsCode = `
    // Set node properties
    Object.assign(n.properties, ${safeProps});`;
  }

  steps.push(`
  // ── Node ${stepIndex}: ${title} (${nodeType}) ──
  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '➕ Adding node: ${title.replace(/'/g, "\\'")} (${nodeType.replace(/'/g, "\\'")})');
  {
    const n = LiteGraph.createNode("${nodeType}");
    if (n) {
      n.pos = [${posX}, ${posY}];
      ${size ? `n.size = [${Array.isArray(size) ? size.join(", ") : `${size[0] || 200}, ${size[1] || 150}`}];` : ""}
      ${node.title && node.title !== nodeType ? `n.title = "${node.title.replace(/"/g, '\\"')}";` : ""}${widgetCode}${propsCode}
      app.graph.add(n);
      nodeRefs[${nodeId}] = n;
      app.graph.setDirtyCanvas(true, true);
    } else {
      console.warn('⚠️  Node type "${nodeType}" not found — skipping');
    }
  }
  await sleep(DELAY);
`);
});

// Now generate connection steps
// We make connections after all nodes exist, grouped by when the target was created
// For visual effect, we'll connect in the same topological order
const connectionsInOrder = [];
sorted.forEach((nodeId) => {
  const conns = connectionsByTarget.get(nodeId) || [];
  conns.forEach((c) => connectionsInOrder.push(c));
});

if (connectionsInOrder.length > 0) {
  steps.push(`
  // ── Connections ──────────────────────────────────────────────
  log(currentStep + 1, totalSteps, '🔗 Connecting nodes...');
  await sleep(DELAY);
`);

  connectionsInOrder.forEach((conn) => {
    const srcNode = nodeMap.get(conn.srcId);
    const tgtNode = nodeMap.get(conn.tgtId);
    const srcName = srcNode
      ? srcNode.title || srcNode.type
      : `Node ${conn.srcId}`;
    const tgtName = tgtNode
      ? tgtNode.title || tgtNode.type
      : `Node ${conn.tgtId}`;

    stepIndex++;

    steps.push(`
  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '🔗 ${srcName.replace(/'/g, "\\'")}[${conn.srcSlot}] → ${tgtName.replace(/'/g, "\\'")}[${conn.tgtSlot}]');
  {
    const src = nodeRefs[${conn.srcId}];
    const tgt = nodeRefs[${conn.tgtId}];
    if (src && tgt) {
      src.connect(${conn.srcSlot}, tgt, ${conn.tgtSlot});
      app.graph.setDirtyCanvas(true, true);
    }
  }
  await sleep(DELAY * 0.6);
`);
  });
}

// Finale
steps.push(`
  // ── Done! ────────────────────────────────────────────────────
  app.graph.setDirtyCanvas(true, true);
  console.log('%c✅ Workflow replay complete! ${nodes.length} nodes, ${links.length} connections.', 'color: #00ff88; font-size: 14px; font-weight: bold;');
  console.log('%cYou can now stop your screen recording.', 'color: #888; font-style: italic;');

})();
`);

// ─── Output ────────────────────────────────────────────────────────────────────

const output = steps.join("\n");

if (outputFile) {
  const outPath = outputFile.endsWith(".js") ? outputFile : `${outputFile}.js`;
  fs.writeFileSync(path.resolve(outPath), output, "utf-8");
  console.log(`\n✅ Replay script written to: ${outPath}`);
  console.log(`   Nodes: ${nodes.length} (in topological order)`);
  console.log(`   Links: ${links.length}`);
  console.log(`   Delay: ${delay}ms per step`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Open ComfyUI in your browser`);
  console.log(`   2. Clear the canvas`);
  console.log(`   3. Open DevTools Console (F12)`);
  console.log(`   4. Copy/paste the contents of ${outPath}`);
  console.log(`   5. Start recording & press Enter in console!\n`);
} else {
  // Print a summary to stderr, script to stdout
  console.error(`\n✅ Replay script generated (${nodes.length} nodes, ${links.length} links, ${delay}ms delay)`);
  console.error(`   Pipe to a file: node workflow-replay.js workflow.json > replay.js\n`);
  process.stdout.write(output);
}

// ─── Also print the build order summary ────────────────────────────────────────

if (outputFile) {
  console.log(`\n📐 Build Order:`);
  sorted.forEach((id, i) => {
    const n = nodeMap.get(id);
    const conns = connectionsByTarget.get(id) || [];
    const connStr = conns
      .map((c) => {
        const src = nodeMap.get(c.srcId);
        return `← ${src ? src.title || src.type : "?"} [${c.srcSlot}]`;
      })
      .join(", ");
    console.log(
      `   ${(i + 1).toString().padStart(2)}. ${(n.title || n.type).padEnd(30)} ${connStr}`
    );
  });
  console.log("");
}

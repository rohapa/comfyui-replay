
// ═══════════════════════════════════════════════════════════════
// ComfyUI Workflow Replay Script
// Generated from: example-workflow.json
// Nodes: 7 | Links: 9 | Delay: 1000ms
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
  const DELAY = 1000;
  const nodeRefs = {}; // Maps original node ID → LiteGraph node reference
  window.__replayStop = false;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function log(step, total, msg) {
    console.log(`%c[Step ${step}/${total}] ${msg}`, 'color: #00d4ff; font-weight: bold;');
  }

  const totalSteps = 16;
  let currentStep = 0;

  // Clear the canvas
  log(0, totalSteps, '🧹 Clearing canvas...');
  app.graph.clear();
  await sleep(DELAY);


  // ── Node 1: Load Checkpoint (CheckpointLoaderSimple) ──
  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '➕ Adding node: Load Checkpoint (CheckpointLoaderSimple)');
  {
    const n = LiteGraph.createNode("CheckpointLoaderSimple");
    if (n) {
      n.pos = [50, 200];
      n.size = [300, 100];
      n.title = "Load Checkpoint";
    // Set widget values
    if (n.widgets && n.widgets.length > 0) {
      const vals = ["v1-5-pruned-emaonly.safetensors"];
      for (let i = 0; i < Math.min(n.widgets.length, vals.length); i++) {
        if (vals[i] !== null && vals[i] !== undefined) {
          n.widgets[i].value = vals[i];
        }
      }
    }
      app.graph.add(n);
      nodeRefs[1] = n;
      app.graph.setDirtyCanvas(true, true);
    } else {
      console.warn('⚠️  Node type "CheckpointLoaderSimple" not found — skipping');
    }
  }
  await sleep(DELAY);


  // ── Node 2: Positive Prompt (CLIPTextEncode) ──
  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '➕ Adding node: Positive Prompt (CLIPTextEncode)');
  {
    const n = LiteGraph.createNode("CLIPTextEncode");
    if (n) {
      n.pos = [400, 100];
      n.size = [300, 150];
      n.title = "Positive Prompt";
    // Set widget values
    if (n.widgets && n.widgets.length > 0) {
      const vals = ["a beautiful sunset over mountains, cinematic lighting, 8k"];
      for (let i = 0; i < Math.min(n.widgets.length, vals.length); i++) {
        if (vals[i] !== null && vals[i] !== undefined) {
          n.widgets[i].value = vals[i];
        }
      }
    }
      app.graph.add(n);
      nodeRefs[2] = n;
      app.graph.setDirtyCanvas(true, true);
    } else {
      console.warn('⚠️  Node type "CLIPTextEncode" not found — skipping');
    }
  }
  await sleep(DELAY);


  // ── Node 3: Negative Prompt (CLIPTextEncode) ──
  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '➕ Adding node: Negative Prompt (CLIPTextEncode)');
  {
    const n = LiteGraph.createNode("CLIPTextEncode");
    if (n) {
      n.pos = [400, 300];
      n.size = [300, 150];
      n.title = "Negative Prompt";
    // Set widget values
    if (n.widgets && n.widgets.length > 0) {
      const vals = ["ugly, blurry, low quality, distorted"];
      for (let i = 0; i < Math.min(n.widgets.length, vals.length); i++) {
        if (vals[i] !== null && vals[i] !== undefined) {
          n.widgets[i].value = vals[i];
        }
      }
    }
      app.graph.add(n);
      nodeRefs[3] = n;
      app.graph.setDirtyCanvas(true, true);
    } else {
      console.warn('⚠️  Node type "CLIPTextEncode" not found — skipping');
    }
  }
  await sleep(DELAY);


  // ── Node 4: Empty Latent Image (EmptyLatentImage) ──
  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '➕ Adding node: Empty Latent Image (EmptyLatentImage)');
  {
    const n = LiteGraph.createNode("EmptyLatentImage");
    if (n) {
      n.pos = [400, 500];
      n.size = [300, 100];
      n.title = "Empty Latent Image";
    // Set widget values
    if (n.widgets && n.widgets.length > 0) {
      const vals = [512,512,1];
      for (let i = 0; i < Math.min(n.widgets.length, vals.length); i++) {
        if (vals[i] !== null && vals[i] !== undefined) {
          n.widgets[i].value = vals[i];
        }
      }
    }
      app.graph.add(n);
      nodeRefs[4] = n;
      app.graph.setDirtyCanvas(true, true);
    } else {
      console.warn('⚠️  Node type "EmptyLatentImage" not found — skipping');
    }
  }
  await sleep(DELAY);


  // ── Node 5: KSampler (KSampler) ──
  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '➕ Adding node: KSampler (KSampler)');
  {
    const n = LiteGraph.createNode("KSampler");
    if (n) {
      n.pos = [800, 200];
      n.size = [300, 250];
      
    // Set widget values
    if (n.widgets && n.widgets.length > 0) {
      const vals = [42,"fixed",20,7,"euler","normal",1];
      for (let i = 0; i < Math.min(n.widgets.length, vals.length); i++) {
        if (vals[i] !== null && vals[i] !== undefined) {
          n.widgets[i].value = vals[i];
        }
      }
    }
      app.graph.add(n);
      nodeRefs[5] = n;
      app.graph.setDirtyCanvas(true, true);
    } else {
      console.warn('⚠️  Node type "KSampler" not found — skipping');
    }
  }
  await sleep(DELAY);


  // ── Node 6: VAE Decode (VAEDecode) ──
  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '➕ Adding node: VAE Decode (VAEDecode)');
  {
    const n = LiteGraph.createNode("VAEDecode");
    if (n) {
      n.pos = [1200, 200];
      n.size = [200, 100];
      n.title = "VAE Decode";
      app.graph.add(n);
      nodeRefs[6] = n;
      app.graph.setDirtyCanvas(true, true);
    } else {
      console.warn('⚠️  Node type "VAEDecode" not found — skipping');
    }
  }
  await sleep(DELAY);


  // ── Node 7: Save Image (SaveImage) ──
  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '➕ Adding node: Save Image (SaveImage)');
  {
    const n = LiteGraph.createNode("SaveImage");
    if (n) {
      n.pos = [1500, 200];
      n.size = [300, 300];
      n.title = "Save Image";
    // Set widget values
    if (n.widgets && n.widgets.length > 0) {
      const vals = ["ComfyUI"];
      for (let i = 0; i < Math.min(n.widgets.length, vals.length); i++) {
        if (vals[i] !== null && vals[i] !== undefined) {
          n.widgets[i].value = vals[i];
        }
      }
    }
      app.graph.add(n);
      nodeRefs[7] = n;
      app.graph.setDirtyCanvas(true, true);
    } else {
      console.warn('⚠️  Node type "SaveImage" not found — skipping');
    }
  }
  await sleep(DELAY);


  // ── Connections ──────────────────────────────────────────────
  log(currentStep + 1, totalSteps, '🔗 Connecting nodes...');
  await sleep(DELAY);


  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '🔗 Load Checkpoint[1] → Positive Prompt[0]');
  {
    const src = nodeRefs[1];
    const tgt = nodeRefs[2];
    if (src && tgt) {
      src.connect(1, tgt, 0);
      app.graph.setDirtyCanvas(true, true);
    }
  }
  await sleep(DELAY * 0.6);


  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '🔗 Load Checkpoint[1] → Negative Prompt[0]');
  {
    const src = nodeRefs[1];
    const tgt = nodeRefs[3];
    if (src && tgt) {
      src.connect(1, tgt, 0);
      app.graph.setDirtyCanvas(true, true);
    }
  }
  await sleep(DELAY * 0.6);


  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '🔗 Load Checkpoint[0] → KSampler[0]');
  {
    const src = nodeRefs[1];
    const tgt = nodeRefs[5];
    if (src && tgt) {
      src.connect(0, tgt, 0);
      app.graph.setDirtyCanvas(true, true);
    }
  }
  await sleep(DELAY * 0.6);


  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '🔗 Positive Prompt[0] → KSampler[1]');
  {
    const src = nodeRefs[2];
    const tgt = nodeRefs[5];
    if (src && tgt) {
      src.connect(0, tgt, 1);
      app.graph.setDirtyCanvas(true, true);
    }
  }
  await sleep(DELAY * 0.6);


  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '🔗 Negative Prompt[0] → KSampler[2]');
  {
    const src = nodeRefs[3];
    const tgt = nodeRefs[5];
    if (src && tgt) {
      src.connect(0, tgt, 2);
      app.graph.setDirtyCanvas(true, true);
    }
  }
  await sleep(DELAY * 0.6);


  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '🔗 Empty Latent Image[0] → KSampler[3]');
  {
    const src = nodeRefs[4];
    const tgt = nodeRefs[5];
    if (src && tgt) {
      src.connect(0, tgt, 3);
      app.graph.setDirtyCanvas(true, true);
    }
  }
  await sleep(DELAY * 0.6);


  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '🔗 KSampler[0] → VAE Decode[0]');
  {
    const src = nodeRefs[5];
    const tgt = nodeRefs[6];
    if (src && tgt) {
      src.connect(0, tgt, 0);
      app.graph.setDirtyCanvas(true, true);
    }
  }
  await sleep(DELAY * 0.6);


  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '🔗 Load Checkpoint[2] → VAE Decode[1]');
  {
    const src = nodeRefs[1];
    const tgt = nodeRefs[6];
    if (src && tgt) {
      src.connect(2, tgt, 1);
      app.graph.setDirtyCanvas(true, true);
    }
  }
  await sleep(DELAY * 0.6);


  if (window.__replayStop) return;
  currentStep++;
  log(currentStep, totalSteps, '🔗 VAE Decode[0] → Save Image[0]');
  {
    const src = nodeRefs[6];
    const tgt = nodeRefs[7];
    if (src && tgt) {
      src.connect(0, tgt, 0);
      app.graph.setDirtyCanvas(true, true);
    }
  }
  await sleep(DELAY * 0.6);


  // ── Done! ────────────────────────────────────────────────────
  app.graph.setDirtyCanvas(true, true);
  console.log('%c✅ Workflow replay complete! 7 nodes, 9 connections.', 'color: #00ff88; font-size: 14px; font-weight: bold;');
  console.log('%cYou can now stop your screen recording.', 'color: #888; font-style: italic;');

})();

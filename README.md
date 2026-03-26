# ComfyUI Workflow Replay Tools

Automated tools for building ComfyUI workflows visually — perfect for screen recording tutorials.

![ComfyUI Replay Generator](assets/comfyui%20replay%20generator.png)

## Setup

```bash
npm install
npx playwright install chromium
```

## Tools

### 🎬 Cursor Replay (Playwright)

Opens a real browser with a visible, animated cursor that builds the workflow step-by-step. Records video automatically.

```bash
# Basic usage (ComfyUI must be running)
node cursor-replay.js my_workflow.json

# With options
node cursor-replay.js my_workflow.json \
  --url http://localhost:8188 \
  --delay 1000 \
  --output ./recordings \
  --viewport 1920x1080
```

**What happens:**
1. Browser opens → canvas clears
2. Cursor moves to each node position → double-clicks → searches type → adds node
3. Cursor drags from output slots to input slots to create connections
4. Video saved to `./recordings/`

| Option | Default | Description |
|--------|---------|-------------|
| `--url` | `http://127.0.0.1:8188` | ComfyUI URL |
| `--delay` | `800` | ms between steps |
| `--output` | `./recordings` | Video output dir |
| `--viewport` | `1920x1080` | Browser size |
| `--no-record` | - | Disable recording |
| `--slow-mo` | `50` | Playwright slow-mo |

---

### UI Options (Web Generator)

| Option | Description |
|--------|-------------|
| **Show Node Labels** | Displays the node title as an on-screen caption when created |
| **Show VO Captions** | Displays the AI narration script as on-screen captions |
| **AI Voice Over Timing** | Automatically adjusts replay speed to match narration length |

### 📋 Console Replay (No Browser Automation)

Generates a JS script you paste into ComfyUI's browser console. No Playwright needed.

```bash
node workflow-replay.js my_workflow.json --output replay --delay 1000
```

Then paste the generated `replay.js` into ComfyUI's DevTools console.

---

### 🎥 Screen Recording (ffmpeg)

External ffmpeg-based screen recording for ComfyUI Desktop (Electron). Bypasses `getDisplayMedia` limitations.

```bash
# Terminal 1: Start the recording server
npm run record

# Terminal 2: Paste generated script into ComfyUI DevTools console
# (with "Record Video" toggle enabled)
```

Records MP4 + generates FCPXML timeline for Premiere/Final Cut.

## How It Works

1. **Parses** the workflow JSON (`nodes` + `links` arrays)
2. **Topologically sorts** nodes so dependencies are created first
3. **Generates** timed build steps (either Playwright actions or JS code)
4. **Connects** nodes in dependency order

## Prerequisites

- **Node.js** ≥ 18
- **ComfyUI** running locally (for cursor replay)
- **ffmpeg** installed (for screen recording: `brew install ffmpeg`)
- All required models/checkpoints installed in ComfyUI

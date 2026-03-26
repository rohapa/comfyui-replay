#!/usr/bin/env node

/**
 * ComfyUI Replay Recording Server
 *
 * Launches ffmpeg to capture the screen while the replay runs in ComfyUI.
 * Communicates with the browser-side replay script via WebSocket.
 *
 * Usage:
 *   node record-server.js [--port 3001] [--screen 3] [--fps 30] [--output ./recordings]
 *
 * The browser replay script connects to ws://localhost:3001 and sends:
 *   { type: "start" }                              → begin recording
 *   { type: "step", name: "...", timeMs: 1234 }    → log a step event
 *   { type: "stop" }                               → stop recording, generate files
 */

const { spawn, execSync } = require("child_process");
const { WebSocketServer } = require("ws");
const fs = require("fs");
const path = require("path");

// ─── CLI Args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let wsPort = 3001;
let screenDevice = null; // auto-detect if not specified
let fps = 30;
let outputDir = "./recordings";
let codec = "h264_videotoolbox"; // hardware-accelerated on macOS, fallback to libx264

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port" && args[i + 1]) { wsPort = parseInt(args[i + 1], 10); i++; }
  else if (args[i] === "--screen" && args[i + 1]) { screenDevice = args[i + 1]; i++; }
  else if (args[i] === "--fps" && args[i + 1]) { fps = parseInt(args[i + 1], 10); i++; }
  else if (args[i] === "--output" && args[i + 1]) { outputDir = args[i + 1]; i++; }
  else if (args[i] === "--codec" && args[i + 1]) { codec = args[i + 1]; i++; }
}

// ─── Auto-detect screen device ─────────────────────────────────────────────────

function detectScreenDevice() {
  if (screenDevice !== null) return screenDevice;

  try {
    const output = execSync('ffmpeg -f avfoundation -list_devices true -i "" 2>&1', {
      encoding: "utf-8",
      timeout: 5000,
    }).toString();
    // Look for "Capture screen N" lines
    const match = output.match(/\[(\d+)\]\s+Capture screen/);
    if (match) {
      console.log(`📺 Auto-detected screen capture device: [${match[1]}]`);
      return match[1];
    }
  } catch (e) {
    // execSync throws on non-zero exit — ffmpeg -list_devices always exits non-zero
    const output = e.stdout?.toString() || e.stderr?.toString() || e.message || "";
    const match = output.match(/\[(\d+)\]\s+Capture screen/);
    if (match) {
      console.log(`📺 Auto-detected screen capture device: [${match[1]}]`);
      return match[1];
    }
  }

  console.warn("⚠️  Could not auto-detect screen device, defaulting to '3'");
  return "3";
}

// ─── Check codec availability ──────────────────────────────────────────────────

function checkCodec(preferred) {
  try {
    const output = execSync(`ffmpeg -codecs 2>&1`, { encoding: "utf-8", timeout: 5000 });
    if (output.includes(preferred)) return preferred;
  } catch (e) {
    const output = e.stdout?.toString() || e.stderr?.toString() || "";
    if (output.includes(preferred)) return preferred;
  }
  console.log(`⚠️  Codec ${preferred} not available, falling back to libx264`);
  return "libx264";
}

// ─── FCPXML Generation ─────────────────────────────────────────────────────────

function generateFCPXML(stepEvents, videoFile, durationMs) {
  const durationFrames = Math.round((durationMs / 1000) * fps);
  const videoBasename = path.basename(videoFile);

  let clipsXml = "";
  for (let i = 0; i < stepEvents.length; i++) {
    const e = stepEvents[i];
    const nxt = i < stepEvents.length - 1
      ? stepEvents[i + 1].timeMs
      : durationMs;

    const startFrame = Math.round((e.timeMs / 1000) * fps);
    let endFrame = Math.round((nxt / 1000) * fps);

    if (endFrame <= startFrame) endFrame = startFrame + 1;
    if (endFrame > durationFrames) endFrame = durationFrames;
    if (startFrame >= durationFrames) break;

    // First clip includes the full file definition
    const fileDef = i === 0
      ? `<file id="file-1"><name>${videoBasename}</name><pathurl>file://localhost/${videoBasename}</pathurl><rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate><duration>${durationFrames}</duration><media><video><duration>${durationFrames}</duration><samplecharacteristics><width>1920</width><height>1080</height></samplecharacteristics></video></media></file>`
      : `<file id="file-1"/>`;

    clipsXml += `\n<clipitem id="clip-${i}"><name>${escapeXml(e.name)}</name><duration>${durationFrames}</duration><rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate><start>${startFrame}</start><end>${endFrame}</end><in>${startFrame}</in><out>${endFrame}</out>${fileDef}</clipitem>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4"><project><name>Comfy Replay</name><children><sequence id="sequence-1"><name>Replay Sequence</name><duration>${durationFrames}</duration><rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate><media><video><track>${clipsXml}</track></video></media></sequence></children></project></xmeml>`;
}

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── Main Server ───────────────────────────────────────────────────────────────

fs.mkdirSync(outputDir, { recursive: true });

const resolvedCodec = checkCodec(codec);
const device = detectScreenDevice();

const wss = new WebSocketServer({ port: wsPort });

console.log(`\n🎬 ComfyUI Recording Server`);
console.log(`   WebSocket: ws://localhost:${wsPort}`);
console.log(`   Screen device: ${device}`);
console.log(`   Codec: ${resolvedCodec}`);
console.log(`   FPS: ${fps}`);
console.log(`   Output: ${path.resolve(outputDir)}`);
console.log(`\n⏳ Waiting for replay to connect...\n`);

let activeRecording = null;

wss.on("connection", (ws) => {
  console.log("🔌 Replay connected");
  let ffmpegProc = null;
  let stepEvents = [];
  let startTime = null;
  let outputFile = null;

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    // ── START ────────────────────────────────────────────────────
    if (msg.type === "start") {
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      outputFile = path.join(outputDir, `comfyui-replay-${ts}.mp4`);
      stepEvents = [];
      startTime = Date.now();

      const ffmpegArgs = [
        "-f", "avfoundation",
        "-framerate", String(fps),
        "-i", `${device}:none`,
        "-c:v", resolvedCodec,
        ...(resolvedCodec === "libx264" ? ["-preset", "fast", "-crf", "18"] : ["-q:v", "35"]),
        "-pix_fmt", "yuv420p",
        "-r", String(fps),
        "-y",
        outputFile,
      ];

      console.log(`\n🔴 Recording started → ${outputFile}`);
      console.log(`   ffmpeg ${ffmpegArgs.join(" ")}`);

      ffmpegProc = spawn("ffmpeg", ffmpegArgs, { stdio: ["pipe", "pipe", "pipe"] });
      activeRecording = { proc: ffmpegProc, outputFile, stepEvents };

      ffmpegProc.stderr.on("data", (data) => {
        // Only show ffmpeg errors/warnings, not the verbose progress
        const line = data.toString().trim();
        if (line.includes("Error") || line.includes("error") || line.includes("Warning")) {
          console.error(`   ffmpeg: ${line}`);
        }
      });

      ffmpegProc.on("close", (code) => {
        console.log(`   ffmpeg exited with code ${code}`);
        activeRecording = null;
      });

      ws.send(JSON.stringify({ type: "recording", file: outputFile }));
    }

    // ── STEP EVENT ───────────────────────────────────────────────
    else if (msg.type === "step") {
      stepEvents.push({ name: msg.name, timeMs: msg.timeMs });
      const elapsed = ((msg.timeMs) / 1000).toFixed(1);
      console.log(`   📌 [${elapsed}s] ${msg.name}`);
    }

    // ── STOP ─────────────────────────────────────────────────────
    else if (msg.type === "stop") {
      const durationMs = Date.now() - (startTime || Date.now());
      console.log(`\n⏹  Stopping recording (${(durationMs / 1000).toFixed(1)}s)...`);

      if (ffmpegProc && !ffmpegProc.killed) {
        // Send 'q' to ffmpeg stdin for graceful shutdown
        ffmpegProc.stdin.write("q");

        ffmpegProc.on("close", () => {
          const result = { type: "done", file: outputFile };

          // Generate FCPXML if we have step events
          if (stepEvents.length > 0) {
            const xmlContent = generateFCPXML(stepEvents, outputFile, durationMs);
            const xmlFile = outputFile.replace(/\.mp4$/, ".xml");
            fs.writeFileSync(xmlFile, xmlContent, "utf-8");
            result.xml = xmlFile;
            console.log(`📋 FCPXML saved → ${xmlFile}`);
          }

          console.log(`✅ Video saved → ${outputFile}`);
          console.log(`\n⏳ Waiting for next replay...\n`);

          ws.send(JSON.stringify(result));
        });
      } else {
        ws.send(JSON.stringify({ type: "done", file: outputFile, error: "ffmpeg was not running" }));
      }
    }
  });

  ws.on("close", () => {
    console.log("🔌 Replay disconnected");
    // If recording is still running, stop it gracefully
    if (ffmpegProc && !ffmpegProc.killed) {
      console.log("   Stopping orphaned recording...");
      ffmpegProc.stdin.write("q");
    }
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });
});

// ─── Graceful shutdown ─────────────────────────────────────────────────────────

process.on("SIGINT", () => {
  console.log("\n\n🛑 Shutting down...");
  if (activeRecording?.proc && !activeRecording.proc.killed) {
    activeRecording.proc.stdin.write("q");
  }
  wss.close();
  setTimeout(() => process.exit(0), 1000);
});

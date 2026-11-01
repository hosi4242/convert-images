import { spawn } from "node:child_process";

const routes = [
  "/image-converter", "/image-compressor", "/image-resizer",
  "/image-size-compare", "/image-dpi-calculator", "/qr-code",
  "/calculator", "/loan-calculator", "/installment-calculator",
  "/unit-converter", "/time-calculator", "/text-tools",
  "/text-cleaner", "/pdf-tools", "/about", "/privacy",
  "/terms", "/contact", "/timer",
];

const host = "127.0.0.1";
const port = 4180;
const origin = `http://${host}:${port}`;
const command = process.platform === "win32" ? "npx.cmd" : "npx";
const server = spawn(command, [
  "--yes", "wrangler@4.156.0", "dev", "--local",
  "--ip", host, "--port", String(port), "--log-level", "error",
], {
  stdio: ["ignore", "pipe", "pipe"],
  shell: process.platform === "win32",
  windowsHide: true,
});

let wranglerOutput = "";
for (const stream of [server.stdout, server.stderr]) {
  stream?.setEncoding("utf8");
  stream?.on("data", (chunk) => {
    wranglerOutput = (wranglerOutput + chunk).slice(-12_000);
  });
}

async function waitForServer() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Wrangler dev exited with code ${server.exitCode}.\n${wranglerOutput || "Wrangler produced no captured output."}`);
    }
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // Wrangler may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Timed out waiting for Wrangler Static Assets preview.\n${wranglerOutput || "Wrangler produced no captured output."}`);
}

try {
  await waitForServer();

  for (const route of routes) {
    const response = await fetch(`${origin}${route}`, { redirect: "manual" });
    const html = await response.text();
    const canonical = `https://toolmingle.dev${route}`;
    if (response.status !== 200) {
      throw new Error(`${route}: expected HTTP 200, received ${response.status}`);
    }
    if (!html.includes(`href="${canonical}"`)) {
      throw new Error(`${route}: Cloudflare Static Assets did not serve the route-specific HTML`);
    }
    console.log(`Cloudflare route verified: ${route}`);
  }

  const unknown = await fetch(`${origin}/__spa_fallback_smoke_test__`);
  const fallbackHtml = await unknown.text();
  if (unknown.status !== 200 || !fallbackHtml.includes('href="https://toolmingle.dev/"')) {
    throw new Error("Unknown routes no longer receive the homepage SPA fallback");
  }

  console.log(`Cloudflare Static Assets routing verified: ${routes.length} SEO routes and SPA fallback`);
} finally {
  server.kill();
}

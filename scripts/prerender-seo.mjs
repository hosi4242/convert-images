import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { chromium } from "@playwright/test";

const routes = [
  "/image-converter",
  "/image-compressor",
  "/image-resizer",
  "/image-size-compare",
  "/image-dpi-calculator",
  "/qr-code",
  "/calculator",
  "/loan-calculator",
  "/installment-calculator",
  "/unit-converter",
  "/time-calculator",
  "/text-tools",
  "/text-cleaner",
  "/pdf-tools",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/timer",
];

const host = "127.0.0.1";
const port = 4179;
const origin = `http://${host}:${port}`;
const viteBin = resolve("node_modules/vite/bin/vite.js");
const server = spawn(process.execPath, [viteBin, "preview", "--host", host, "--port", String(port), "--strictPort"], {
  stdio: "ignore",
  windowsHide: true,
});

let browser;

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Vite preview exited with code ${server.exitCode}`);
    }
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // The preview server may still be starting.
    }
    await delay(250);
  }
  throw new Error("Timed out waiting for the Vite preview server");
}

try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const route of routes) {
    const response = await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    if (!response?.ok()) {
      throw new Error(`${route}: preview returned HTTP ${response?.status() ?? "no response"}`);
    }

    await page.waitForFunction((path) => {
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      return canonical === `https://toolmingle.dev${path}` && Boolean(jsonLd?.textContent);
    }, route, { timeout: 15_000 });

    const metadata = await page.evaluate(() => {
      const get = (selector) => document.querySelector(selector)?.getAttribute("content") ?? "";
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";
      const jsonLdText = document.querySelector('script[type="application/ld+json"]')?.textContent ?? "";
      let jsonLdValid = false;
      try {
        JSON.parse(jsonLdText);
        jsonLdValid = true;
      } catch {
        // Report malformed structured data below.
      }
      return {
        title: document.title,
        description: get('meta[name="description"]'),
        canonical,
        ogUrl: get('meta[property="og:url"]'),
        jsonLdValid,
      };
    });

    if (!metadata.title.trim() || !metadata.description.trim()) {
      throw new Error(`${route}: missing title or meta description`);
    }
    if (metadata.canonical !== `https://toolmingle.dev${route}`) {
      throw new Error(`${route}: incorrect canonical URL: ${metadata.canonical}`);
    }
    if (metadata.ogUrl !== `https://toolmingle.dev${route}`) {
      throw new Error(`${route}: incorrect og:url: ${metadata.ogUrl || "(missing)"}`);
    }
    if (!metadata.jsonLdValid) {
      throw new Error(`${route}: missing or invalid JSON-LD`);
    }

    const outputPath = resolve("dist", route.slice(1), "index.html");
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, await page.content(), "utf8");
    console.log(`Prerendered ${route}`);
  }

  const homepage = await readFile(resolve("dist/index.html"), "utf8");
  if (!homepage.includes('href="https://toolmingle.dev/"')) {
    throw new Error("Homepage canonical URL was unexpectedly changed");
  }

  console.log(`SEO prerender complete: ${routes.length} routes`);
} finally {
  await browser?.close();
  server.kill();
}

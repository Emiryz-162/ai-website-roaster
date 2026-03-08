import express from "express";
import { chromium, Browser } from "playwright-chromium";
import { getStealthOptions, applyStealthScripts } from "./stealth";

const PORT = parseInt(process.env.PORT || "9222", 10);
const TIMEOUT = 20_000;
const MAX_RETRIES = 2;

let browser: Browser;

const app = express();
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/screenshot", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "URL is required", code: "INVALID_URL" });
    return;
  }

  try {
    new URL(url);
  } catch {
    res.status(400).json({ error: "Invalid URL format", code: "INVALID_URL" });
    return;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const stealthOpts = getStealthOptions();

    try {
      const context = await browser.newContext({
        userAgent: stealthOpts.userAgent,
        viewport: stealthOpts.viewport,
        locale: stealthOpts.locale,
        extraHTTPHeaders: stealthOpts.extraHTTPHeaders,
      });

      await applyStealthScripts(context);
      const page = await context.newPage();

      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: TIMEOUT,
      });

      const status = response?.status() ?? 0;
      const html = await page.content();

      // Detect bot protection
      const botKeywords = ["captcha", "challenge", "cloudflare", "access denied", "blocked"];
      const lowerHtml = html.toLowerCase();
      const isBotProtected =
        status === 403 || botKeywords.some((kw) => lowerHtml.includes(kw) && html.length < 5000);

      if (isBotProtected) {
        await context.close();
        res.status(200).json({
          error: "Site returned bot protection. Try uploading HTML manually.",
          code: "BOT_PROTECTED",
        });
        return;
      }

      const screenshotBuffer = await page.screenshot({ type: "png", fullPage: false });
      const screenshot = screenshotBuffer.toString("base64");

      await context.close();

      res.json({ html, screenshot, status });
      return;
    } catch (err) {
      lastError = err as Error;
      // eslint-disable-next-line no-console
      console.warn(`Attempt ${attempt + 1} failed for ${url}: ${(err as Error).message}`);
    }
  }

  res.status(500).json({
    error: `Failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`,
    code: "TIMEOUT",
  });
});

app.post("/lighthouse", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  try {
    // Dynamic import for ESM compatibility
    const lighthouse = await import("lighthouse");
    const chromeLaunch = await import("chrome-launcher");
    const chrome = await chromeLaunch.launch({ chromeFlags: ["--headless"] });

    const result = await lighthouse.default(url, {
      port: chrome.port,
      output: "json",
      onlyCategories: ["performance", "accessibility", "seo"],
    });

    await chrome.kill();

    if (!result?.lhr) {
      res.status(500).json({ error: "Lighthouse returned no results" });
      return;
    }

    const { categories } = result.lhr;
    res.json({
      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100),
    });
  } catch (err) {
    // Lighthouse is optional — fail gracefully
    res.status(500).json({
      error: `Lighthouse failed: ${(err as Error).message}`,
      code: "LIGHTHOUSE_UNAVAILABLE",
    });
  }
});

async function start() {
  browser = await chromium.launch({ headless: true });
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Worker listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start worker:", err);
  process.exit(1);
});

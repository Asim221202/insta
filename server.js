const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium"); // Render için optimize edilmiş chromium

const app = express();
const PORT = process.env.PORT || 3000;

async function fetchInstagramMedia(instaUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // 2 dakika timeout
    await page.goto(instaUrl, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });

    const mediaUrl = await page.evaluate(() => {
      const videoEl = document.querySelector("video");
      if (videoEl) return videoEl.src;

      const imgEl = document.querySelector("img");
      if (imgEl) return imgEl.src;

      return null;
    });

    return mediaUrl;
  } catch (err) {
    console.error("fetchInstagramMedia error:", err);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

// API endpoint
app.get("/api/insta", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "URL parametresi gerekli ?url=" });
  }

  const mediaUrl = await fetchInstagramMedia(url);
  if (!mediaUrl) {
    return res.status(500).json({ error: "Medya alınamadı" });
  }

  res.json({ mediaUrl });
});

// Root test
app.get("/", (req, res) => {
  res.send("✅ Instagram Fetch API Çalışıyor!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

// Puppeteer ile Instagram'dan medya URL çekme
async function fetchInstagramMedia(instaUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Instagram bot algılamasın diye User-Agent ekle
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    // Sayfaya git (timeout yükseltilmiş + networkidle2 yerine domcontentloaded)
    await page.goto(instaUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Video veya resim elementi bekle
    await page.waitForSelector("video, img", { timeout: 15000 });

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
app.get("/api/instagram", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res
      .status(400)
      .json({ success: false, message: "Instagram URL gerekli" });
  }

  try {
    const mediaUrl = await fetchInstagramMedia(url);
    if (!mediaUrl) {
      return res
        .status(404)
        .json({ success: false, message: "Medya bulunamadı" });
    }

    res.json({ success: true, mediaUrl });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

// Basit test sayfası
app.get("/", (req, res) => {
  res.send("✅ Instagram scraper çalışıyor. /api/instagram?url=... kullan");
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

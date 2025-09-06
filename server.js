const express = require('express');
const chromium = require('chromium');
const puppeteer = require('puppeteer-core');

const app = express();
app.use(express.json());

async function fetchInstagramMedia(instaUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: chromium.path,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    const page = await browser.newPage();
    await page.goto(instaUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const mediaUrl = await page.evaluate(() => {
      const videoEl = document.querySelector('video');
      if (videoEl) return videoEl.src;
      const imgEl = document.querySelector('img');
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

app.get('/api/instagram', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ success: false, message: "URL gerekli" });

  try {
    const mediaUrl = await fetchInstagramMedia(url);
    if (!mediaUrl) return res.status(404).json({ success: false, message: "Medya bulunamadı" });

    res.json({ success: true, mediaUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

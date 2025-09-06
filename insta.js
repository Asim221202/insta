const puppeteer = require('puppeteer');

async function fetchInstagramMedia(instaUrl) {
    let browser;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.goto(instaUrl, { waitUntil: 'networkidle2' });

        // Video varsa video URL’sini al
        const videoUrl = await page.evaluate(() => {
            const videoEl = document.querySelector('video');
            if (videoEl) return videoEl.src;

            const imgEl = document.querySelector('img');
            if (imgEl) return imgEl.src;

            return null;
        });

        return videoUrl;
    } catch (err) {
        console.error('Puppeteer Instagram fetch error:', err);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}
const mediaUrl = await fetchInstagramMedia('https://www.instagram.com/reel/DOEra5KjrK5/');
console.log(mediaUrl); // Direkt mp4 URL veya img URL

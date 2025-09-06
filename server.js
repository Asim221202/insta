require('dotenv').config();
const express = require('express');
const InstagramScraper = require('instagram-media-scraper');

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// Instagram scraper instance
const scraper = new InstagramScraper();

// POST: /api/instagram  -> { "url": "..." }
app.post('/api/instagram', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL yok' });

    try {
        const media = await scraper.getMedia(url);
        res.json({
            success: true,
            type: media.type,
            urls: media.urls,
            caption: media.caption,
            author: media.author
        });
    } catch (err) {
        console.error('Instagram fetch error:', err);
        res.status(500).json({ success: false, message: 'Instagram fetch hatası' });
    }
});

// GET: /api/instagram?url=...
app.get('/api/instagram', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ success: false, message: 'URL yok' });

    try {
        const media = await scraper.getMedia(url);
        res.json({
            success: true,
            type: media.type,
            urls: media.urls,
            caption: media.caption,
            author: media.author
        });
    } catch (err) {
        console.error('Instagram fetch error:', err);
        res.status(500).json({ success: false, message: 'Instagram fetch hatası' });
    }
});

// Test route
app.get('/', (req, res) => {
    res.send('Instagram Scraper API çalışıyor ✅');
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

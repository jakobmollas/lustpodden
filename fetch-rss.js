// // scripts/fetch-rss.js
import Parser from 'rss-parser';
import { writeFileSync } from 'fs';

const FEED_URL = 'https://feed.podbean.com/lustpodden/feed.xml';
const OUT = './src/episodes.json';

const parser = new Parser();

async function fetchAndWrite() {
    console.log('Fetching RSS:', FEED_URL);
    const feed = await parser.parseURL(FEED_URL);
    console.log('Feed title:', feed.title);

    const episodes = feed.items.map((item, idx) => ({
        // Add/modify to suit the needs
        title: item.title || '',
        link: item.link || '',
        pubDate: new Date(item.pubDate).toISOString().split('T')[0],
        description: normalizeText(item.content || ''),
        duration: item.itunes?.duration || null,
        durationMinutes: Math.floor((item.itunes?.duration || 0) / 60)  // duration = seconds

        // Enable this if we need tags
        // tags: (item.categories || item.itunes?.keywords || '')
        // ? // split keywords if they exist as a comma list
        // (Array.isArray(item.categories) && item.categories.length
        // ? item.categories
        // : String(item.itunes?.keywords || '').split(',').map(s => s.trim()).filter(Boolean))
        // : []
    }));

    writeFileSync(OUT, JSON.stringify(episodes, null, 2));

    console.log(`Wrote ${episodes.length} episodes to ${OUT}`);
}

fetchAndWrite().catch(err => {
    console.error(err);
    process.exit(1);
});

function normalizeText(text) {
  if (!text) return '';
  return text
    .replace(/\u00A0/g, ' ')             // non-breaking space → normal space
    .replace(/\r\n/g, '\n')             // normalize CRLF
    .replace(/\n+/g, '<br>')            // convert one or more newlines → single <br>
    .replace(/(<br>\s*){2,}/g, '<br>')  // collapse multiple <br> in a row → one <br>
    .replace(/(<br>\s*)+$/g, '')        // remove trailing <br> at end
    .trim();                            // remove leading/trailing junk
}
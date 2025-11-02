// // scripts/fetch-rss.js
import Parser from 'rss-parser';
import { writeFileSync } from 'fs';
import fetch from 'node-fetch';
import 'dotenv/config';

const FEED_URL = process.env.PODBEAN_FEED_URL || 'https://feed.podbean.com/lustpodden/feed.xml';
const OUT = './src/episodes.json';

const parser = new Parser();

async function fetchSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    if (!res.ok) throw new Error(`Spotify token error: ${res.status}`);
    const data = await res.json();
    return data.access_token;
}

async function fetchSpotifyEpisodes(showId, token) {
  const all = [];
  let url = `https://api.spotify.com/v1/shows/${showId}/episodes?limit=50`;
  
  
  while (url) {
    console.log(`Getting Spotify episodes from '${url}'`);

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
    const data = await res.json();
    all.push(...data.items);
    url = data.next; // next page, if any
  }
  return all.map(ep => ({
    title: ep.name.trim(),
    link: ep.external_urls.spotify
  }));
}

async function fetchAndWrite() {
  console.log('Fetching RSS:', FEED_URL);
  const feed = await parser.parseURL(FEED_URL);
  console.log('Feed title:', feed.title);

  // 1️⃣ Authenticate Spotify API
  const token = await fetchSpotifyToken();
  const showId = process.env.SPOTIFY_SHOW_ID;
  console.log('Fetching Spotify episodes for show:', showId);
  const spotifyEpisodes = await fetchSpotifyEpisodes(showId, token);

  // 2️⃣ Build normalized list
  const episodes = feed.items.map(item => {
    const title = item.title?.trim() || '';
    const spotifyMatch = spotifyEpisodes.find(s => s.title === title);
    return {
      title,
      link: item.link || '',
      spotify: spotifyMatch ? spotifyMatch.link : '',
      pubDate: new Date(item.pubDate).toISOString().split('T')[0],
      description: normalizeText(item.content || ''),
      durationMinutes: Math.floor((item.itunes?.duration || 0) / 60)
    };
  });

  writeFileSync(OUT, JSON.stringify(episodes, null, 2));
  console.log(`Wrote ${episodes.length} episodes to ${OUT}`);
}

// async function fetchAndWrite() {
//     console.log('Fetching RSS:', FEED_URL);
//     const feed = await parser.parseURL(FEED_URL);
//     console.log('Feed title:', feed.title);

//     const episodes = feed.items.map((item, idx) => ({
//         // Add/modify to suit the needs
//         title: item.title || '',
//         link: item.link || '',
//         pubDate: new Date(item.pubDate).toISOString().split('T')[0],
//         description: normalizeText(item.content || ''),
//         durationMinutes: Math.floor((item.itunes?.duration || 0) / 60)  // duration = seconds

//         // Enable this if we need tags
//         // tags: (item.categories || item.itunes?.keywords || '')
//         // ? // split keywords if they exist as a comma list
//         // (Array.isArray(item.categories) && item.categories.length
//         // ? item.categories
//         // : String(item.itunes?.keywords || '').split(',').map(s => s.trim()).filter(Boolean))
//         // : []
//     }));

//     writeFileSync(OUT, JSON.stringify(episodes, null, 2));

//     console.log(`Wrote ${episodes.length} episodes to ${OUT}`);
// }

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
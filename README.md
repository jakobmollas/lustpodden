# Lustpodden Search
Podcast Search — Podbean RSS + Spotify API + GitHub Actions + Fuse.js

Simple static web page that offers client-side in-mem full text search of podcast episodes downloaded at build-time from a Podbean RSS feed.
GitHub Actions + a cron definition pulls down the RSS feed, attempts to pull down matching Spotify episode data to get Spotify links, extracts relevant data and creates a JSON file.
The resulting data is then pushed to GitHub pages (via branch) and served from there.
Styling is done via Bootstrap.

It uses Fuse.js to power search functionality, see: https://www.fusejs.io/

To trigger the workflow manually: 
* Use Actions > Build and Deploy Podcast Site > Run workflow
* Or simply push to `main`

## Local development

```bash
npm install
npm run build
```

Use for example Live Server Five to serve up the data:
https://marketplace.visualstudio.com/items?itemName=yandeu.five-server

Open http://127.0.0.1:5500/src/ to see the output.

## Spotify API Integration
Since we want to get direct links to episodes hosted by Spotify, we need to interact with the Spotify API.
Unfortunately we cannot construct links programmatically since spotify uses opaque perma links.
Instead, we use the Spotify API to get episode data.

### Authentication
```
POST https://accounts.spotify.com/api/token
Content-type: application/x-www-form-urlencoded

Payload:
* grant_type: client_credentials
* client_id: ...
* client_secret: ...
```

Secrets and variables are stored as Github Repo Secrets (for Actions)

### Find Show Details
```
GET https://api.spotify.com/v1/search?q={show-name}&type=show
Auth: Bearer token
```

In our case, at the time of writing the id is: `4bCocNmxcDEbbq4KZ96Lm0`

### Get Show Episodes
```
GET https://api.spotify.com/v1/shows/4bCocNmxcDEbbq4KZ96Lm0/episodes?offset=0&limit=50
Auth: Bearer token
```

Max limit is 50 per request.
# Lustpodden Search
Podcast Search — GitHub Actions + Fuse.js

Simple static web page that offers client-side in-mem full text search of podcast episodes downloaded at build-time from a Podbean RSS feed.
GitHub Actions + a cron definition pulls down the RSS feed, extracts relevant data and creates a JSON file.
The resulting data is then pushed to GitHub pages (via branch) and serverd from there.
Styling is done via Bootstrap.

It uses Fuse.js to power search functionality, see: https://www.fusejs.io/

Trigger the workflow manually: 
* Use Actions > Build and Deploy Podcast Site > Run workflow
* O simply push to `main`

## Local development

```bash
npm install
npm run build
```

Use for example Live Server (5) to serve up the data:
https://marketplace.visualstudio.com/items?itemName=yandeu.five-server

open http://127.0.0.1:5500/src/
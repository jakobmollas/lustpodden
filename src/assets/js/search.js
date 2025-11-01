// src/assets/js/search.js
(async function () {
    async function loadEpisodes() {
        const res = await fetch('/episodes.json');
        if (!res.ok) throw new Error('Could not load episodes.json');
        return res.json();
    }


    function render(list) {
        const out = document.getElementById('results');
        if (!out) return;
        if (!list || list.length === 0) {
            out.innerHTML = '<div class="col-12">No results</div>';
            return;
        }
        out.innerHTML = list.map(ep => `
<div class="col-12 col-md-6 mb-3">
<div class="card h-100">
<div class="card-body">
    <h5 class="card-title"><a href="${ep.link}" target="_blank" rel="noopener">${ep.title}</a></h5>
    <h6 class="card-subtitle mb-2 text-muted">${ep.pubDate || ''} (${ep.durationMinutes} minutes)</h6>
    <p class="card-text">${(ep.description || '')}</p>    
</div>
</div>
</div>
`).join('');
    }

    try {
        const episodes = await loadEpisodes();
        render(episodes);

        // const fuse = new Fuse(episodes, {
        //     keys: ['title', 'summary', 'description', 'tags'],
        //     threshold: 0.35,
        //     includeMatches: true
        // });

        const fuse = new Fuse(episodes, {
            keys: [
                { name: 'title', weight: 0.5 },
                { name: 'description', weight: 0.3 },
                { name: 'pubDate', weight: 0.2 }
            ],
            isCaseSensitive: false,       // Case-insensitive
            shouldSort: false,            // Do not sort, use original order, which is descending episode order
            includeScore: true,
            threshold: 0.1,               // Adjust fuzziness (0 = exact only)
            ignoreLocation: true,         // Ignore position in string
            minMatchCharLength: 2,        // Ignore super-short matches
            useExtendedSearch: true       // Enables operators like '="' (exact match)
        });

        const input = document.getElementById('search-input');
        input.addEventListener('input', (e) => {
            const q = e.target.value.trim();
            if (!q) return render(episodes);
            const res = fuse.search(q).map(r => r.item);
            render(res);
        });
    } catch (err) {
        console.error(err);
        const out = document.getElementById('results');
        if (out) out.innerHTML = '<div class="col-12">Error loading episodes</div>';
    }
})();
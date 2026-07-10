# Cinerank

A public showcase of one cinephile's taste: movies rated across four categories (Plot,
Filmography, Sound, Vibe), browsable and shareable. One person authors it in Document Authoring;
everyone else — friends, or anyone with the link — browses, sorts, filters, and plays with it.
No accounts, no backend, no server to run.

**Live:** https://main--cinerank--costaalacuparmare.aem.live/

---

## Features

### Stats — the homepage (`/`)
A "by the numbers" dashboard: total movies, average score, a score-distribution chart,
most-watched director, most common vibe, and the highest-rated movie. Computed entirely from the
Library's data, no separate authoring.

### Library (`/library`)
The core log of everything watched. Each movie gets a poster, director, cast, and summary
(fetched live from TMDB), a personal review, and a score in each of the four categories (0–10,
with a rare 11 for something exceptional). The grid is sortable and filterable by score, year,
director, actor, or genre/vibe tag, with a title search box on top. Movies whose overall score
comes out above 10 get a gold highlight. Adding a movie is a single authoring step — the grid is
generated from an index of every page under `/movies/**`, so nothing needs duplicating.

### Duels (`/duels`)
A playful "which is better" comparison toy — purely for fun, it never changes a movie's real
score. Three modes: **Random** (reshuffles 2–4 movies), **Custom** (pick specific movies via
type-ahead), and **Bracket** (a 16-movie single-elimination tournament rendered as an actual
bracket tree — click a movie each round to advance it).

### Backlog (`/backlog`)
What's not yet confidently in the Library — either not watched yet, or watched but not
confidently scored. A simple searchable, filterable checklist (to-watch / needs-rewatch).

### Calendar (`/calendar`)
A month-grid view of what's planned next, and where (streaming platform or a physical venue).
Clicking a planned movie cycles it through watched → missed → planned — a personal,
this-device-only note (no backend to write back to), harmless for anyone to try. Includes an
"Export .ics" button to download the plan into any calendar app.

---

## Why this shape

EDS has no backend or database — content is authored by hand and everything else is static,
public delivery. That's a great fit for a showcase site (fast, no accounts, no server), and a
poor fit for anything needing frequent writes or state synced across devices. Cinerank leans into
the former and calls out — rather than forces — the latter; see **Future work** below.

---

## Future work (needs a backend)

Deliberately not built as-is, since each of these needs either state that changes often outside
of a page visit, or logic that runs without one triggering it:

- Duel/Bracket results that actually adjust a movie's real library score
- Proactive "leaving streaming soon" alerts (checked on a schedule, not just on visit)
- Adding or editing a movie directly from the public site (today: an owner-only "Edit in DA"
  link that deep-links to the real editor instead)
- Personal rating weights that persist and sync across devices
- A truly interactive, drag-to-reschedule Calendar

---

## Development

### Environments
- Preview: https://main--cinerank--costaalacuparmare.aem.page/
- Live: https://main--cinerank--costaalacuparmare.aem.live/

### Documentation

Before using the aem-boilerplate, we recommand you to go through the documentation on https://www.aem.live/docs/ and more specifically:
1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

### Installation

```sh
npm i
```

### Linting

```sh
npm run lint
```

### Local development

1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
2. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
3. Start AEM Proxy: `aem up --html-folder drafts --html-mount /` (opens your browser at
   `http://localhost:3000` — `--html-mount /` is needed so draft content resolves at real paths
   like `/`, `/library`, `/movies/...` instead of under `/drafts/...`)
4. Open the `cinerank` directory in your favorite IDE and start coding :)

### Adding a new movie

Adding a movie is a **content** change in Document Authoring
(`https://da.live/#/costaalacuparmare/cinerank`), not a code change — works from any device with a
browser, no laptop required.

1. In da.live, create a new document under `movies/` (e.g. `movies/your-movie-slug`)
2. Author the `movie` block with 2–3 rows:
   - Row 1: title and year, e.g. `Poor Things (2023)` — also used as the TMDB search query
   - Row 2: your 4 scores, labeled — `**Plot:** 9 **Filmography:** 8 **Sound:** 7 **Vibe:** 10`
   - Row 3 *(optional)*: your personal review, free text
3. Author the `metadata` block (bottom of the page): `title`, `director`, `year`, the 4
   `*-score` fields, and `tags` (any of the fixed genre/vibe list — this is what the Library's
   filters actually read from)
4. Preview, check it renders right, then publish

Poster, director, cast, and summary all auto-fill from TMDB — you only type the title/year,
scores, review, and metadata. It appears in the grid automatically on next publish.

If you're logged into da.live in the same browser, each movie's detail page also has an
**"Edit in DA"** link (top-right, "owner mode" only) that jumps straight to that page's editor —
a convenience link, not a write feature; it needs no credentials of its own.

**Turning on owner mode:** visit any page once with `?owner=true` in the URL (e.g.
`https://main--cinerank--costaalacuparmare.aem.live/calendar?owner=true`) — it's saved in that
browser from then on.

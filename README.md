# Cinerank

A public showcase of one cinephile's taste: movies rated across four categories (Plot,
Filmography, Sound, Vibe), browsable and shareable — built so friends can look through the
library, poke at comparisons, and see what's queued up next, not just the person who authors it.

*Personal movie library, reframed as a "show your friends" site rather than a private tracking
tool — doubling as the EDS test site for the Nightshift project's M1 milestone. Started as a
Notepad habit; this formalizes and expands it.*

---

## Core concept

A public movie library where every watched movie gets a **4-axis rating** (not a single score).
The site is read-first: one author (you) logs ratings via Document Authoring; everyone else —
friends, or anyone with the link — browses, sorts, filters, and (for some features) interacts
without needing an account. That single-writer/many-readers shape is deliberate — see
"Why this shape" below.

---

## Why this shape (read-first, single writer)

EDS (this site's platform) has no backend and no database — content is authored by hand in
Document Authoring, and everything else is static, fast, public delivery. That's a genuinely good
fit for a showcase site: no accounts, no auth, no server to run, and it plays to EDS's actual
strength (fast public reading of curated content). It's a poor fit for anything that wants
frequent writes from an interactive UI, or state that needs to persist and sync across devices.

So the plan going forward: build what fits this shape well now, and call out — rather than force —
the parts that would need real backend infrastructure. See "Future work — needs a backend" below
for that list.

---

## Roadmap / build order

Not the same as the feature numbering below — that's organized by concept, this is organized by
actual dependency order. Calendar (Feature 3) explicitly depends on Backlog (Feature 4) existing
first ("pull candidates from the Backlog"), so it can't come before it despite the numbering.

1. **Library** *(shipped v2)* — `movie` detail-page block (TMDB-reference row, 4-axis scores,
   optional review, back-to-Library link, and an owner-only "Edit in DA" deep link), nav bar
   (Library/Versus/Backlog/Calendar, with an active-page highlight), and a `library` poster-grid
   landing page, all correlated together and themed with the theater dark/light toggle. Real TMDB
   integration (poster/director/cast/summary, both on detail pages and grid tiles), a title search
   box, sort by score/title/year/category, cross-matching type-ahead filters for year/director/
   actor, and a genre/vibe dropdown (fixed curated list) are all live. The grid is now sourced
   from the **EDS query-index** (`helix-query.yaml`, scoped to `/movies/**`)
   instead of a manually-duplicated row per movie — adding a movie is one authoring step, not two.
   37 movies currently in the library. See "Adding a new movie" below for the authoring workflow.
2. **Versus/Duel** — reframed as a public, ephemeral "which do you think is better" toy for
   visitors (see Feature 2) rather than a mechanism that rewrites your library scores. No
   dependency on Backlog/Calendar; can be built any time after Library.
3. **Backlog** — a public "what I'm planning to watch next" display. Needed before Calendar can
   be meaningfully built.
4. **Calendar** — depends on Backlog existing (pulls "want to watch" candidates from it); reframed
   as a display of your plan, not an interactive scheduler (see Feature 3).

**Local dev note:** the dev server needs `--html-mount /` alongside `--html-folder drafts` so
draft content resolves at real paths (`/`, `/nav`, `/movies/...`) instead of under `/drafts/...` —
run `aem up --html-folder drafts --html-mount /`.

---

## Feature 1 — Library (main feature)

The core log of everything you've watched, public.

**Per-movie data:**
- Poster/art, director, main cast, year, short summary (sourced from TMDB — see Technical notes)
- Personal review — free-text, your own voice, visible to anyone browsing
- Your rating, on **4 categories**: Plot, Filmography, Sound, Vibe
  - Each scored 0-10, with an allowance up to **11** for a genuinely exceptional score in that
    category (currently: any category can go to 11, used rarely, no special-casing beyond that
    in the code)
- Streaming availability: which platform, in which country (read-only TMDB fetch, same pattern as
  posters — no backend needed). A *true* "leaving soon" alert needs a backend (see Future work);
  a weaker approximation — diffing current providers against an authored "last known platform" on
  each visit — is buildable without one, if worth doing
- Genre/vibe tags for filtering — a **fixed curated list** (decided, not freeform): cozy,
  unsettling, kinetic, tense, whimsical, bleak, epic, heartfelt, chaotic, dreamlike
- **Rewatch history** — each watch logged separately with its own date + score, authored as an
  extra table on that movie's own page. This turned out to not need a backend: it's just richer
  authored content, since nothing needs to query across movies' rewatches, only display one
  movie's own list on its own page
- **External ratings/notes** — surface how a movie did elsewhere (IMDb, Rotten Tomatoes,
  Letterboxd, etc.) alongside your own 4-axis score, for reference/comparison, not folded into
  your own rating. Not really an EDS-vs-backend question — it's a data-availability problem on any
  stack: Letterboxd has no API at all, IMDb/RT don't have good free ones, so this likely needs
  scraping regardless of architecture
- **Per-category weights, as a visitor toy** — instead of *your* private weights that need to
  persist and sync across your devices (a backend problem, see Future work), let any visitor drag
  sliders and see the rankings reshuffle for *them*, client-side, nothing saved. Reframed this way
  it's a fun feature, not a backend requirement

**Library view:** sortable/filterable by any of the above (score, category, director, actor, year,
tag, platform, etc.) — shipped. Title search box on top; year/director/actor are type-ahead
inputs (cross-match as you type) rather than dropdowns, since those pools get too large for a
plain `<select>`; genre/vibe stays a dropdown since that list is small and fixed.

---

## Feature 2 — Versus / Duel / Bracket (name TBD)

A public, playful comparison toy — not a mechanism that rewrites your library's real scores.

- Pick two movies (or let a visitor pick), compare on **one specific category or overall** —
  "which had better Sound, X or Y?" — computed live from already-authored scores
- Result is **ephemeral** — nothing persists, resets on reload. (The original idea — an
  Elo-style refinement that actually adjusts the underlying stored score, modeled on how the
  restaurant-ranking app **Beli** builds rankings from repeated pairwise picks — is real and worth
  doing eventually, but it wants a backend; see Future work.)
- **Brackets** — either a static authored "here's my 2026 bracket results" page, or an interactive
  bracket-runner a visitor can play with in their own browser (ephemeral, same as above)

---

## Feature 3 — Calendar

A public display of what you're planning to watch, when, and where — not an interactive scheduler.

- Pull candidates from the Backlog (Feature 4) — movies marked "want to watch"
- Show a planned date, authored by you (updated the same way you update anything else — da.live)
- Show **where**: a streaming platform, another online source, or a **physical venue** — e.g.
  cinema, or a specific retro cinema (Cinema Europa, Bucharest) — so "where" spans both digital and
  physical options, not just streaming

A genuinely interactive, editable calendar (drag to reschedule, etc.) wants a backend — see
Future work.

---

## Feature 4 — Backlog (not-yet-watched, separate from Library)

Movies you haven't watched yet, shown publicly, separate from the Library — you move them over
(in da.live) once watched.

- **Collections** within the backlog:
  - Genre-based lists
  - Director-based lists (filmography tracking — "8 of Villeneuve's 11 watched, 3 to go," linking
    back to Library entries for the ones already seen)
  - Custom ranked lists (e.g. "must-watch 2026," ranked via the Versus/Bracket toy)
- Feeds directly into the Calendar display

---

## Future work — needs a backend

Deliberately not built on EDS as-is. Each of these wants either persisted state that changes
often, or logic that needs to run without a page visit triggering it — both mean a real
backend (e.g. a small serverless function), which is a bigger, separate task from anything else
in this repo.

- **Versus results that actually adjust library scores** (the original Elo-style idea) — needs
  somewhere to durably store the adjustment, updated on every comparison
- **Real "leaving soon" alerts** — proactive, checked periodically even when nobody's visiting
  (needs a cron/serverless job, not just a client-side fetch)
- **Editing from the live site itself** — both "add a new movie" and "edit an existing movie's
  score/review" from a button on the public pages are the same underlying need: a write to DA
  triggered from a visitor's browser, which needs a serverless function to hold credentials
  safely, not just client-side JS. One backend task covers both, not two. In the meantime,
  `movie.js` has an owner-only "Edit in DA" link (`localStorage` gated) that's a real convenience
  but not a save-in-place feature — it just deep-links to da.live's own editor for that page
- **Personal per-category weights that persist and sync across your devices** — the visitor-facing
  version (Feature 1) is backend-free; this specific version (yours, saved, everywhere) isn't
- **A genuinely interactive, editable Calendar** — drag-to-reschedule, live editing — vs. the
  static authored display version that's in scope now
- **Accounts** — still deliberately out of scope entirely; the site has exactly one writer (you)

---

## Technical notes (not final decisions, just groundwork)

- **Data source:** TMDB API (free) for poster/art, cast/crew, metadata, and its
  `/movie/{id}/watch/providers` endpoint for region-specific streaming availability — covers most
  of Feature 1's metadata needs without building a data pipeline from scratch.
- **Flow diversity for Nightshift's M1 needs:** this concept naturally gives 3+ structurally
  different flows to later plant defects/breakage into — browsing/rating (Library), a comparison
  interaction (Versus), and a scheduling/planning flow (Calendar) — good variety of interaction
  shapes, plus real external API integration (a more realistic "modern site" surface than static
  content).
- **Why the reframe helps Nightshift too:** a public, single-writer/many-reader site is a more
  realistic "modern site" shape to plant defects/breakage into than a private tool would be —
  most real sites work this way.

---

## Open questions

- [ ] Final name for the Versus/comparison feature
- [ ] Final name for the Backlog/not-watched section ("Progression" vs. "Backlog" vs. other)
- [x] Whether "vibe" tags are freeform text or a fixed curated set — fixed list, see Feature 1
- [ ] Which 2-3 of these flows are the actual MVP for M1 vs. built out later
- [ ] Whether/when to invest in any of the "Future work" backend items, vs. leaving them deferred
      indefinitely

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
   `http://localhost:3000`) — see the roadmap note above on why `--html-mount /` is needed
4. Open the `cinerank` directory in your favorite IDE and start coding :)

### Adding a new movie

Content (pages) and code (blocks/JS/CSS) are two separate systems here — adding a movie is a
**content** change, done in Document Authoring (DA) at `https://da.live/#/costaalacuparmare/cinerank`,
not a code change. Works from any device with a browser, including a phone — no laptop required.
**One authoring step** — the grid is query-index-driven, so there's no second row to duplicate
into a home-page listing anymore.

1. In da.live, create a new document under `movies/` (e.g. `movies/your-movie-slug`)
2. Author the `movie` block with 2-3 rows:
   - Row 1: the movie's title and year, e.g. `Poor Things (2023)` — this doubles as the TMDB
     search query, so keep it close to the real title
   - Row 2: your 4 scores, labeled — `**Plot:** 9 **Filmography:** 8 **Sound:** 7 **Vibe:** 10`
     (0-10, or 11 for a rare exceptional score)
   - Row 3 *(optional)*: your personal review, free text
3. Author the `metadata` block (bottom of the page, same doc): `title`, `director`, `year`, the 4
   `*-score` fields matching row 2, and `tags` (any of the fixed genre/vibe list — this is what
   the query-index and the grid's filters actually read from, not the visible `movie` block)
4. Preview it (DA's own "Preview" action, or ask an agent to hit the Admin API), check it renders
   right, then publish

Poster, director, cast, and summary all auto-fill on the live site from TMDB — you only ever type
the title/year, your scores, your review, and the metadata block. It'll appear in the grid
automatically on next publish, no separate step.

If you're logged into da.live in the same browser, each movie's detail page also has an
**"Edit in DA"** link (top-right, only visible once you've set
`localStorage.setItem('cinerank-owner', 'true')` in your own browser) that jumps straight to that
page's editor — a convenience link, not a write feature; it needs no credentials of its own.

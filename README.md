# Cinerank

A cinephile's movie library: rate films across four categories (Plot, Filmography, Sound, Vibe),
rank them head-to-head, and plan what to watch, when, and where.

*Personal movie tracking/ranking app, doubling as the EDS test site*

---

## Core concept

A personal movie library where every watched movie gets a **4-axis rating** (not a single score),
with tools to browse/sort your history, rank movies against each other, plan what to watch and
where, and track a structured backlog of what's coming up — including collections by genre,
director, or custom ranked lists.

---

## Roadmap / build order

Not the same as the feature numbering above — that's organized by concept, this is organized by
actual dependency order. Calendar (Feature 3) explicitly depends on Backlog (Feature 4) existing
first ("pull candidates from the Backlog"), so it can't come before it despite the numbering.

1. **Library** *(shipped v1)* — `movie` detail-page block (TMDB-reference row, 4-axis scores,
   optional review, back-to-Library link), nav bar (Library/Versus/Backlog/Calendar, with an
   active-page highlight), and a `library` poster-grid landing page, all correlated together and
   themed with the theater dark/light toggle. The grid is currently **manually authored** (one row
   per movie) rather than sourced from the EDS query-index — query-index can't be exercised
   against local `drafts/` content since it only indexes pages actually published to the content
   source. Swapping the grid to read `/query-index.json` is a fast follow once movie pages are for
   real published/added beyond the initial 3.
2. **Versus/Duel** — no dependency on Backlog/Calendar, just needs Library entries to compare.
   Can be built any time after Library.
3. **Backlog** — needed before Calendar can be meaningfully built.
4. **Calendar** — depends on Backlog existing (pulls "want to watch" candidates from it).

Cross-cutting, not tied to one feature, revisit opportunistically: real TMDB API integration
(currently stubbed in `movie.js`'s `fetchTmdbData()`), accounts (deliberately out of scope —
personal single-user tool).

**Local dev note:** the dev server needs `--html-mount /` alongside `--html-folder drafts` so
draft content resolves at real paths (`/`, `/nav`, `/movies/...`) instead of under `/drafts/...` —
run `aem up --html-folder drafts --html-mount /`.

---

## Feature 1 — Library (main feature)

The core log of everything you've watched.

**Per-movie data:**
- Poster/art, director, main cast, year, short summary (sourced from TMDB — see Technical notes)
- Personal review — free-text, private, not shaped like a public review
- Your rating, on **4 categories**: Plot, Filmography, Sound, Vibe
  - Each scored 0-10, with an allowance up to **11** for a genuinely exceptional score in that
    category (confirm: is this a deliberate "these go to eleven" exception, used rarely?)
  - **Weights** — configurable per category, so your overall score reflects what actually matters
    to you (e.g. weight Vibe higher than Filmography), and can evolve over time
- Streaming availability: which platform, in which country, and **when it's leaving** that
  platform (a "leaving soon" alert for anything on your radar) — plus, since this is personal,
  "other sites" availability too
- Genre/vibe tags for filtering (e.g. "cozy," "unsettling," "kinetic" — felt tags, not just genre)
- **Rewatch history** — each watch logged separately with its own date + score, so you can see how
  your opinion of a movie changed over time instead of overwriting the old rating
- **External ratings/notes** — surface how a movie did elsewhere (IMDb, Rotten Tomatoes,
  Letterboxd, etc.) alongside your own 4-axis score on its detail page, purely for reference/
  comparison, not folded into your own rating. Not scoped yet: which of these have a usable free
  API (Letterboxd notably doesn't), vs. what would need scraping.

**Library view:** sortable/filterable by any of the above (score, category, director, year, tag,
platform, etc.)

**Still open:** exact 0-10-vs-11 mechanic; whether "vibe" tags are freeform or a curated fixed set.

---

## Feature 2 — Versus / Duel / Bracket (name TBD)

Compare movies head-to-head instead of relying purely on remembered absolute scores.

- Pick two movies, compare on **one specific category or overall** — "which had better Sound, X or
  Y?"
- Result can **adjust the underlying score** of one or both movies (an Elo-style refinement, not
  just a one-off comparison) — modeled on how the restaurant-ranking app **Beli** builds accurate
  personal rankings from repeated pairwise picks rather than absolute star ratings
- **Brackets** — tournament-style, e.g. "rank my top 16 movies of the year" by running them through
  head-to-head rounds

**Still open:** exact scoring-adjustment algorithm; whether brackets are ad-hoc or based on
saved collections (see Feature 4).

---

## Feature 3 — Calendar

Plan what to watch, when, and where.

- Pull candidates from the Backlog (Feature 4) — movies marked "want to watch"
- Schedule a date to watch them
- Choose **where**: a streaming platform, another online source, or a **physical venue** — e.g.
  cinema, or a specific retro cinema (Cinema Europa, Bucharest) — so "where" spans both digital and
  physical options, not just streaming

---

## Feature 4 — Backlog (not-yet-watched, separate from Library)

Movies you haven't watched yet live here, not in the Library — they move over once watched.

- **Collections** within the backlog:
  - Genre-based lists
  - Director-based lists (filmography tracking — "8 of Villeneuve's 11 watched, 3 to go," linking
    back to Library entries for the ones already seen)
  - Custom ranked lists (e.g. "must-watch 2026," ranked via the Versus/Bracket mechanic)
- Feeds directly into the Calendar for scheduling

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

---

## Open questions

- [ ] Final name for the Versus/comparison feature
- [ ] Final name for the Backlog/not-watched section ("Progression" vs. "Backlog" vs. other)
- [ ] Exact 0-10 / exceptional-11 rating mechanic
- [ ] Whether "vibe" tags are freeform text or a fixed curated set
- [ ] Versus scoring-adjustment algorithm (how much does a single comparison move a score?)
- [ ] Which 2-3 of these flows are the actual MVP for M1 vs. built out later

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
3. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
4. Open the `cinerank` directory in your favorite IDE and start coding :)

// TMDB v4 Read Access Token — intentionally client-side. EDS blocks have no backend, and this
// token is scoped read-only by TMDB specifically for embedding in public client apps like this.
const TMDB_READ_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlYWRkOTQ0ODZiZWQ0MTE5Nzc0NzE2MGQyNGRmZWVmZiIsIm5iZiI6MTc4MzU5MTQ1Mi42ODMsInN1YiI6IjZhNGY3MjFjMWYxYTNlZTgyMmEwOTQ3MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.y7vE4hvGRWnlNaifqHz7fGWLfjYb96XGin2h87Ngwik';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

/**
 * @param {string} path TMDB API path, including query string
 * @returns {Promise<Object|null>} parsed JSON, or null on any failure
 */
async function tmdbFetch(path) {
  try {
    const res = await fetch(`${TMDB_BASE}${path}`, {
      headers: { Authorization: `Bearer ${TMDB_READ_TOKEN}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Resolves a movie's poster, director, cast, year, and summary from TMDB.
 * @param {string} reference TMDB ID, or a "Title (Year)" string authored in the block
 * @returns {Promise<{title: string, poster: string|null, director: string|null,
 *   cast: string|null, year: string|null, summary: string|null}>}
 */
export default async function fetchTmdbData(reference) {
  const trimmed = reference.trim();
  let movie = null;

  if (/^\d+$/.test(trimmed)) {
    movie = await tmdbFetch(`/movie/${trimmed}?append_to_response=credits`);
  } else {
    const match = trimmed.match(/^(.*?)\s*\((\d{4})\)\s*$/);
    const title = match ? match[1] : trimmed;
    const year = match ? match[2] : undefined;
    const params = new URLSearchParams({ query: title });
    if (year) params.set('year', year);
    const searchResult = await tmdbFetch(`/search/movie?${params.toString()}`);
    const candidate = searchResult?.results?.[0];
    if (candidate) {
      movie = await tmdbFetch(`/movie/${candidate.id}?append_to_response=credits`);
    }
  }

  if (!movie) {
    return {
      title: reference, poster: null, director: null, cast: null, year: null, summary: null,
    };
  }

  const director = movie.credits?.crew?.find((person) => person.job === 'Director')?.name || null;
  const cast = movie.credits?.cast?.slice(0, 6).map((person) => person.name).join(', ') || null;

  return {
    title: movie.title || reference,
    poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
    director,
    cast,
    year: movie.release_date ? movie.release_date.slice(0, 4) : null,
    summary: movie.overview || null,
  };
}

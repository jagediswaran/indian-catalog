const fetch = require("node-fetch");
require("dotenv").config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const REALITY_GENRE_ID = 10764;
const PAGE_SIZE = 20;

if (!TMDB_API_KEY) {
  console.warn("[WARN] TMDB_API_KEY is not set. Requests will fail.");
}

const genreCache = { movie: null, tv: null };

async function loadGenres(mediaType) {
  if (genreCache[mediaType]) return genreCache[mediaType];
  const url = `${TMDB_BASE}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}&language=en-US`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const map = {};
    (data.genres || []).forEach((g) => (map[g.id] = g.name));
    genreCache[mediaType] = map;
    return map;
  } catch (e) {
    console.error("Failed to load genres:", e.message);
    return {};
  }
}

function parseCatalogId(id) {
  const parts = id.split("-");
  return { lang: parts[1], kind: parts[2] };
}

function skipToPage(skip) {
  const s = parseInt(skip, 10) || 0;
  return Math.floor(s / PAGE_SIZE) + 1;
}

function buildDiscoverUrl(lang, kind, page) {
  const isMovie = kind === "movie";
  const endpoint = isMovie ? "discover/movie" : "discover/tv";

  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    with_original_language: lang,
    with_origin_country: "IN",
    sort_by: "popularity.desc",
    include_adult: "false",
    page: String(page),
    language: "en-US",
  });

  if (kind === "reality") {
    params.set("with_genres", String(REALITY_GENRE_ID));
  }

  return `${TMDB_BASE}/${endpoint}?${params.toString()}`;
}

function toMetaItem(item, stremioType, genreMap) {
  const isMovie = stremioType === "movie";
  const title = isMovie ? item.title : item.name;
  const date = isMovie ? item.release_date : item.first_air_date;
  const year = date ? date.slice(0, 4) : "";

  return {
    id: `tmdb:${item.id}`,
    type: stremioType,
    name: title || "Untitled",
    poster: item.poster_path ? `${IMG_BASE}${item.poster_path}` : undefined,
    background: item.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
      : undefined,
    description: item.overview || "",
    genres: (item.genre_ids || []).map((g) => genreMap[g]).filter(Boolean),
    releaseInfo: year,
    posterShape: "poster",
  };
}

async function getCatalog(type, id, extra = {}) {
  const { lang, kind } = parseCatalogId(id);
  if (!lang || !kind) return { metas: [] };

  const page = skipToPage(extra.skip);
  const mediaType = kind === "movie" ? "movie" : "tv";
  const stremioType = kind === "movie" ? "movie" : "series";

  const genreMap = await loadGenres(mediaType);
  const url = buildDiscoverUrl(lang, kind, page);

  try {
    const res = await fetch(url);
    const data = await res.json();
    const metas = (data.results || []).map((item) =>
      toMetaItem(item, stremioType, genreMap)
    );
    return { metas };
  } catch (e) {
    console.error("Catalog fetch error:", e.message);
    return { metas: [] };
  }
}

async function getMeta(type, id) {
  const tmdbId = id.replace("tmdb:", "");
  const mediaType = type === "movie" ? "movie" : "tv";
  const url = `${TMDB_BASE}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`;

  try {
    const res = await fetch(url);
    const item = await res.json();
    const isMovie = type === "movie";
    const title = isMovie ? item.title : item.name;
    const date = isMovie ? item.release_date : item.first_air_date;

    const meta = {
      id,
      type,
      name: title || "Untitled",
      poster: item.poster_path ? `${IMG_BASE}${item.poster_path}` : undefined,
      background: item.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
        : undefined,
      description: item.overview || "",
      genres: (item.genres || []).map((g) => g.name),
      releaseInfo: date ? date.slice(0, 4) : "",
      imdbRating: item.vote_average ? item.vote_average.toFixed(1) : undefined,
      runtime: item.runtime ? `${item.runtime} min` : undefined,
    };
    return { meta };
  } catch (e) {
    console.error("Meta fetch error:", e.message);
    return { meta: {} };
  }
}

module.exports = { getCatalog, getMeta };

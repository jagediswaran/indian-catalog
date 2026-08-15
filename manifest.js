const LANGUAGES = [
  { code: "ta", name: "Tamil" },
  { code: "hi", name: "Hindi" },
  { code: "ml", name: "Malayalam" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "mr", name: "Marathi" },
  { code: "bn", name: "Bengali" },
];

const KINDS = [
  { key: "movie", stremioType: "movie", label: "Movies" },
  { key: "series", stremioType: "series", label: "Series" },
  { key: "reality", stremioType: "series", label: "Reality Shows" },
];

const catalogs = [];
for (const lang of LANGUAGES) {
  for (const kind of KINDS) {
    catalogs.push({
      id: `ind-${lang.code}-${kind.key}`,
      type: kind.stremioType,
      name: `${lang.name} ${kind.label}`,
      extra: [{ name: "skip", isRequired: false }],
    });
  }
}

const manifest = {
  id: "org.indian.regional.catalog",
  version: "1.0.0",
  name: "Indian Regional Catalog",
  description:
    "Browse Indian movies, series, and reality shows across Tamil, Hindi, Malayalam, Telugu, Kannada, Marathi, and Bengali. Powered by TMDB.",
  logo: "https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg",
  resources: ["catalog", "meta"],
  types: ["movie", "series"],
  idPrefixes: ["tmdb:"],
  catalogs,
};

module.exports = { manifest, LANGUAGES, KINDS };

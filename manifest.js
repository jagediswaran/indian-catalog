const catalogs = [
  { id: "mov-ta", type: "movie", name: "Movies - Tamil" },
  { id: "mov-hi", type: "movie", name: "Movies - Hindi" },
  { id: "mov-ml", type: "movie", name: "Movies - Malayalam" },
  { id: "mov-other", type: "movie", name: "Movies - Telugu, Kannada & Others" },
  { id: "shows-ta", type: "series", name: "Indian Shows - Tamil" },
  { id: "shows-other", type: "series", name: "Indian Shows - All Other Languages" },
].map((c) => ({
  ...c,
  extra: [{ name: "skip", isRequired: false }],
}));

const manifest = {
  id: "org.indian.regional.catalog",
  version: "2.0.0",
  name: "Indian Regional Catalog",
  description:
    "Indian movies and shows across Tamil, Hindi, Malayalam, Telugu, Kannada, Marathi, and Bengali. Powered by TMDB.",
  logo: "https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg",
  resources: ["catalog", "meta"],
  types: ["movie", "series"],
  idPrefixes: ["tmdb:"],
  catalogs,
};

module.exports = { manifest };

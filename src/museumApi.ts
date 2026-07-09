import { Artwork } from "./types";
import { PAKISTAN_ARTWORKS } from "./pakistanArtworks";

// Direct browser calls to the museum open-access APIs (both send
// Access-Control-Allow-Origin: *), so the gallery works on static hosting
// like GitHub Pages where no /api server exists.

const AMBIENT_EN = "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg";
const AMBIENT_UR = "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg";
const EXCLUDED = /israel|tel aviv/i;

const classifyMedium = (source: string): Artwork["medium"] =>
  /ceramic|clay|porcelain|pottery|glass|earthenware|terracotta/i.test(source) ? "Clay & Ceramic" : "Painting";

// The gallery only hangs paintings and ceramics — sculptures are skipped entirely
const isSculpture = (source: string) =>
  /sculpture|statue|schist|stone|marble|bronze|relief|carv|figurine|bust/i.test(source) &&
  !/ceramic|clay|porcelain|pottery|earthenware|terracotta/i.test(source);

async function searchMet(query: string, limit = 8): Promise<Artwork[]> {
  const searchRes = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(query)}`
  );
  if (!searchRes.ok) return [];
  const { objectIDs } = await searchRes.json();
  if (!Array.isArray(objectIDs)) return [];

  const objects = await Promise.all(
    objectIDs.slice(0, limit).map(async (id: number) => {
      try {
        const res = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
        return res.ok ? await res.json() : null;
      } catch {
        return null;
      }
    })
  );

  return objects
    .filter((o) =>
      o &&
      (o.primaryImageSmall || o.primaryImage) &&
      !EXCLUDED.test(`${o.title} ${o.artistDisplayName} ${o.country} ${o.culture}`) &&
      !isSculpture(`${o.medium || ""} ${o.classification || ""} ${o.objectName || ""}`)
    )
    .map(toMetArtwork);
}

function toMetArtwork(o: any): Artwork {
  return {
      id: `met_${o.objectID}`,
      title: o.title || "Untitled Masterpiece",
      artist_name: o.artistDisplayName || "Unknown Master Artist",
      artist_bio: o.artistDisplayBio || "",
      year_created: o.objectBeginDate || 0,
      origin_country: o.country || o.culture || "Unknown",
      origin_city: o.city || undefined,
      medium: classifyMedium(`${o.medium || ""} ${o.classification || ""}`),
      dimensions: o.dimensions || "Dimensions variable",
      rating: 5,
      image_url: o.primaryImageSmall || o.primaryImage,
      audio_description_url: AMBIENT_EN,
      audio_urdu_url: AMBIENT_UR,
      text_description: `${o.title || "This work"} — ${o.medium || "a masterwork"}${o.period ? `, ${o.period}` : ""}. Its materials, scale, and collection context point to the visual choices and cultural setting preserved in the Metropolitan Museum of Art collection.`,
      text_description_urdu: `${o.title} میٹروپولیٹن میوزیم آف آرٹ کے مجموعے کا ایک شاندار شاہکار ہے۔`,
      is_published: true,
  };
}

async function searchCleveland(query: string, limit = 8): Promise<Artwork[]> {
  const res = await fetch(
    `https://openaccess-api.clevelandart.org/api/artworks/?q=${encodeURIComponent(query)}&limit=${limit}&has_image=1`
  );
  if (!res.ok) return [];
  const { data } = await res.json();
  if (!Array.isArray(data)) return [];

  return data
    .filter((item) =>
      item?.images?.web?.url &&
      !EXCLUDED.test(`${item.title} ${item.creators?.[0]?.description || ""} ${item.culture?.[0] || ""}`) &&
      !isSculpture(`${item.type || ""} ${item.technique || ""}`)
    )
    .map(toCmaArtwork);
}

function toCmaArtwork(item: any): Artwork {
  return {
      id: `cma_${item.id}`,
      title: item.title || "Untitled Masterpiece",
      artist_name: item.creators?.[0]?.description?.split(" (")[0] || "Unknown Master Artist",
      artist_bio: item.creators?.[0]?.description || "",
      year_created: item.creation_date_earliest || 0,
      origin_country: item.culture?.[0] || "Unknown",
      medium: classifyMedium(item.type || ""),
      dimensions: typeof item.dimensions === "string" ? item.dimensions : "Dimensions variable",
      rating: 5,
      image_url: item.images.web.url,
      audio_description_url: AMBIENT_EN,
      audio_urdu_url: AMBIENT_UR,
      text_description: `${item.title || "This work"} — ${item.type || "a masterwork"}${item.culture?.[0] ? ` from ${item.culture[0]}` : ""}. Its form, surface, and collection context point to the visual choices and cultural setting preserved in the Cleveland Museum of Art collection.`,
      text_description_urdu: `${item.title} کلیولینڈ میوزیم آف آرٹ کے مجموعے کا ایک شاندار شاہکار ہے۔`,
      is_published: true,
  };
}

// Resolve a single shared artwork id ("met_123" / "cma_456") straight from its museum API
export async function fetchArtworkById(id: string): Promise<Artwork | null> {
  const curated = PAKISTAN_ARTWORKS.find(a => a.id === id);
  if (curated) return curated;
  try {
    if (id.startsWith("met_")) {
      const res = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id.slice(4)}`);
      if (!res.ok) return null;
      const o = await res.json();
      return o && (o.primaryImageSmall || o.primaryImage) ? toMetArtwork(o) : null;
    }
    if (id.startsWith("cma_")) {
      const res = await fetch(`https://openaccess-api.clevelandart.org/api/artworks/${id.slice(4)}`);
      if (!res.ok) return null;
      const { data } = await res.json();
      return data?.images?.web?.url ? toCmaArtwork(data) : null;
    }
  } catch {
    // fall through
  }
  return null;
}

const dedupe = (artworks: Artwork[]) => {
  const seen = new Set<string>();
  return artworks.filter((art) => !seen.has(art.id) && seen.add(art.id));
};

export async function searchMuseums(query: string): Promise<Artwork[]> {
  const q = query.toLowerCase();
  const curated = PAKISTAN_ARTWORKS.filter(a =>
    `${a.title} ${a.artist_name} ${a.origin_country}`.toLowerCase().includes(q)
  );
  const [met, cma] = await Promise.all([
    searchMet(query).catch(() => []),
    searchCleveland(query).catch(() => []),
  ]);
  return dedupe([...curated, ...met, ...cma]);
}

// Researched guide text from the web: search Wikipedia for the artwork (then
// its artist) and use the encyclopedia extract instead of the API template.
// Wikipedia's APIs are CORS-open, so this works on static hosting.
async function wikiSummary(searchTerm: string): Promise<string | null> {
  const searchRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*&srlimit=1`
  );
  if (!searchRes.ok) return null;
  const hit = (await searchRes.json())?.query?.search?.[0]?.title;
  if (!hit) return null;

  // Only accept a hit that plausibly matches the query (shares a word > 3 chars)
  const words = searchTerm.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  if (!words.some(w => hit.toLowerCase().includes(w))) return null;

  const sumRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit)}`);
  if (!sumRes.ok) return null;
  const extract = (await sumRes.json())?.extract;
  return typeof extract === "string" && extract.length > 80 ? extract : null;
}

// Description comes only from an article about the artwork itself — never the
// artist's biography. The artist's article feeds artist_bio separately.
export async function fetchWebInfo(art: Artwork): Promise<{ description: string | null; artistBio: string | null }> {
  const hasArtist = !!art.artist_name && !/unknown/i.test(art.artist_name);
  const [rawDescription, artistBio] = await Promise.all([
    wikiSummary(art.title).catch(() => null),
    hasArtist ? wikiSummary(art.artist_name).catch(() => null) : Promise.resolve(null),
  ]);
  // A title search can land on the artist's biography page — keep those out
  const looksLikeBiography = (text: string) =>
    /\b(was|is) an? [^.]{0,60}\b(painter|artist|calligrapher|sculptor|printmaker|potter|architect|photographer|engraver)\b/i.test(text.split(".")[0] || "");
  const mentionsArtistMoreThanArtwork = (text: string) => {
    if (!hasArtist) return false;
    const lowerText = text.toLowerCase();
    const lowerTitle = art.title.toLowerCase();
    const lowerArtist = art.artist_name.toLowerCase();
    return lowerText.includes(lowerArtist) && !lowerText.includes(lowerTitle);
  };
  const description =
    rawDescription && !looksLikeBiography(rawDescription) && !mentionsArtistMoreThanArtwork(rawDescription)
      ? rawDescription
      : null;
  return { description, artistBio };
}

// Opening exhibition: a few culture themes fetched live so the gallery and
// splash are populated with real museum pieces (never hardcoded defaults).
const THEMES = [
  "mughal miniature painting",
  "persian painting",
  "ukiyo-e",
  "chinese landscape painting",
  "islamic ceramic",
  "korean celadon",
  "egyptian painting",
  "greek pottery",
];

export async function fetchOpeningCollection(): Promise<Artwork[]> {
  const picked = [...THEMES].sort(() => 0.5 - Math.random()).slice(0, 3);
  const results = await Promise.all(picked.map((theme) => searchMuseums(theme).catch(() => [])));
  // Contemporary Pakistani painters (curated from Artmajeur) always hang in the exhibition
  return dedupe([...PAKISTAN_ARTWORKS, ...results.flat()]);
}

import { Artwork } from "./types";

// Direct browser calls to the museum open-access APIs (both send
// Access-Control-Allow-Origin: *), so the gallery works on static hosting
// like GitHub Pages where no /api server exists.

const AMBIENT_EN = "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg";
const AMBIENT_UR = "https://actions.google.com/sounds/v1/ambiences/night_crickets.ogg";
const EXCLUDED = /israel|tel aviv/i;

const classifyMedium = (source: string): Artwork["medium"] =>
  /ceramic|clay|porcelain|pottery|glass/i.test(source) ? "Clay & Ceramic" : "Painting";

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
      !EXCLUDED.test(`${o.title} ${o.artistDisplayName} ${o.country} ${o.culture}`)
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
      text_description: `“${o.title}”${o.artistDisplayName ? ` by ${o.artistDisplayName}` : ""} — ${o.medium || "a masterwork"}${o.period ? `, ${o.period}` : ""}. From the Metropolitan Museum of Art collection.`,
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
      !EXCLUDED.test(`${item.title} ${item.creators?.[0]?.description || ""} ${item.culture?.[0] || ""}`)
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
      text_description: `“${item.title}” — ${item.type || "a masterwork"}${item.culture?.[0] ? ` from ${item.culture[0]}` : ""}. From the Cleveland Museum of Art collection.`,
      text_description_urdu: `${item.title} کلیولینڈ میوزیم آف آرٹ کے مجموعے کا ایک شاندار شاہکار ہے۔`,
      is_published: true,
  };
}

// Resolve a single shared artwork id ("met_123" / "cma_456") straight from its museum API
export async function fetchArtworkById(id: string): Promise<Artwork | null> {
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
  const [met, cma] = await Promise.all([
    searchMet(query).catch(() => []),
    searchCleveland(query).catch(() => []),
  ]);
  return dedupe([...met, ...cma]);
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
  return dedupe(results.flat());
}

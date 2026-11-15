import opening_hours from "opening_hours";

// ---- finding shops (OpenStreetMap via Overpass, free, no API key) ----
export async function fetchShops(lat, lon, radius = 1500) {
  const query = `
    [out:json][timeout:15];
    nwr["shop"~"^(supermarket|convenience|greengrocer)$"](around:${radius},${lat},${lon});
    out center 80;
  `;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: new URLSearchParams({ data: query }),
  });
  if (!res.ok) throw new Error("Couldn't load nearby shops. Try again in a minute.");
  const data = await res.json();

  return data.elements
    .map((el) => {
      const tags = el.tags || {};
      return {
        id: `${el.type}-${el.id}`,
        name: tags.name || tags.brand || "Local shop",
        brand: tags.brand || tags.name || "",
        type: tags.shop,
        // shops drawn as buildings have a "center" instead of lat/lon
        lat: el.lat ?? el.center?.lat,
        lon: el.lon ?? el.center?.lon,
        hours: tags.opening_hours || null,
      };
    })
    .filter((shop) => shop.lat != null && shop.lon != null);
}

// ---- open now? true / false / null (null = hours unknown) ----
export function openNow(shop) {
  if (!shop.hours) return null;
  try {
    const oh = new opening_hours(shop.hours, {
      lat: shop.lat,
      lon: shop.lon,
      address: { country_code: "gb" },
    });
    return oh.getState();
  } catch {
    return null; // some OSM hours are written in ways the library can't read
  }
}

// ---- rough price level compared with an average supermarket (1.0) ----
// These are estimates for ranking, not real prices. Order matters:
// "Tesco Express" must match before plain "Tesco".
const PRICE_LEVELS = [
  [/aldi/i, 0.85],
  [/lidl/i, 0.86],
  [/asda/i, 0.94],
  [/morrisons daily/i, 1.12],
  [/morrisons/i, 0.98],
  [/tesco express/i, 1.1],
  [/tesco/i, 1.0],
  [/sainsbury'?s local/i, 1.12],
  [/sainsbury/i, 1.03],
  [/co-?op/i, 1.18],
  [/waitrose/i, 1.2],
  [/m&s|marks/i, 1.25],
];

function priceLevel(shop) {
  const found = PRICE_LEVELS.find(([pattern]) => pattern.test(shop.brand));
  if (found) return found[1];
  if (shop.type === "convenience") return 1.2; // independent corner shops
  if (shop.type === "greengrocer") return 0.95;
  return 1.0;
}

// ---- will this shop have everything? (a guess from the shop type) ----
const CORNER_SHOP_AISLES = new Set(["fruit & veg", "bakery", "dairy & eggs", "cupboard"]);

function mightNotHave(shop, items) {
  if (shop.type === "supermarket") return [];
  if (shop.type === "greengrocer") return items.filter((i) => i.aisle !== "fruit & veg");
  return items.filter((i) => !CORNER_SHOP_AISLES.has(i.aisle));
}

// ---- distance in metres (haversine formula) ----
function distanceM(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(m) {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
}

// ---- put it all together and sort the best shop first ----
export function rankShops(shops, items, origin) {
  const basket = items.reduce((sum, i) => sum + (i.estimated_price || 0), 0);

  return shops
    .map((shop) => ({
      ...shop,
      open: openNow(shop),
      distance: distanceM(origin, shop),
      missing: mightNotHave(shop, items),
      cost: basket > 0 ? basket * priceLevel(shop) : null,
    }))
    .filter((shop) => shop.open !== false) // drop shops we know are closed
    .sort(
      (a, b) =>
        a.missing.length - b.missing.length || // has everything first
        (b.open === true) - (a.open === true) || // confirmed open before "hours unknown"
        (a.cost ?? 0) - (b.cost ?? 0) || // then cheapest
        a.distance - b.distance // then nearest
    );
}
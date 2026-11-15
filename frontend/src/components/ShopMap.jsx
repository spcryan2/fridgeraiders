import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchShops, rankShops, formatDistance } from "../utils/shops.js";
import { formatPrice } from "../utils/shoppingList.js";

function ShopMap({ items, onClose }) {
  // take a snapshot of the list when the map opens, so ticking items doesn't refetch
  const [list] = useState(() =>
    items.map((item) => (typeof item === "string" ? { name: item } : item))
  );
  const [origin, setOrigin] = useState(null);
  const [shops, setShops] = useState([]);
  const [status, setStatus] = useState("locating"); // locating | loading | ready | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false; // stops old results landing if the map is closed early

    if (!navigator.geolocation) {
      setError("Your browser can't share your location.");
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const here = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        if (cancelled) return;
        setOrigin(here);
        setStatus("loading");
        try {
          const found = await fetchShops(here.lat, here.lon);
          if (cancelled) return;
          setShops(rankShops(found, list, here));
          setStatus("ready");
        } catch (err) {
          if (cancelled) return;
          setError(err.message);
          setStatus("error");
        }
      },
      (err) => {
        if (cancelled) return;
        setError(
          err.code === 1
            ? "Location is blocked. Allow it in your browser settings to find shops."
            : "Couldn't find your location. Try again outside or with Wi-Fi on."
        );
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      cancelled = true;
    };
  }, [list]);

  const best = shops[0];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream text-forest">
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="wordmark text-2xl">Nearby shops</h2>
        <button
          onClick={onClose}
          className="rounded-full px-3 py-1.5 text-sm font-semibold text-forest/60 hover:bg-forest/5"
        >
          ✕ Close
        </button>
      </header>

      {status === "locating" && <p className="px-5">📍 Finding you…</p>}
      {status === "loading" && <p className="px-5">🛒 Looking for open shops…</p>}
      {status === "error" && (
        <p className="mx-5 rounded-2xl bg-tomato/15 px-4 py-3 text-sm">{error}</p>
      )}

      {origin && (
        <MapContainer
          center={[origin.lat, origin.lon]}
          zoom={15}
          className="h-[40vh] w-full shrink-0"
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {/* you */}
          <CircleMarker
            center={[origin.lat, origin.lon]}
            radius={8}
            pathOptions={{ color: "#1f3d2b", fillColor: "#3b82f6", fillOpacity: 1 }}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
          {/* shops: the best one is bigger and lime */}
          {shops.map((shop) => (
            <CircleMarker
              key={shop.id}
              center={[shop.lat, shop.lon]}
              radius={shop === best ? 11 : 7}
              pathOptions={{
                color: "#1f3d2b",
                fillColor: shop === best ? "#8cd43a" : "#f6f9ec",
                fillOpacity: 1,
              }}
            >
              <Popup>{shop.name}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      )}

      {status === "ready" && (
        <ul className="flex-1 space-y-3 overflow-y-auto p-5">
          {shops.length === 0 && <li>No open shops found within 1.5 km.</li>}
          {shops.map((shop) => (
            <li
              key={shop.id}
              className={`rounded-2xl bg-white p-4 ring-1 ${
                shop === best ? "ring-2 ring-lime" : "ring-forest/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">
                    {shop === best && "⭐ "}
                    {shop.name}
                  </p>
                  <p className="text-sm text-forest/60">
                    {formatDistance(shop.distance)} ·{" "}
                    {shop.open === true ? "🟢 Open now" : "⚪ Hours unknown"}
                  </p>
                </div>
                {shop.cost != null && (
                  <p className="text-right text-sm">
                    <span className="block font-bold">~{formatPrice(shop.cost)}</span>
                    <span className="text-forest/50">estimated</span>
                  </p>
                )}
              </div>

              <p className="mt-2 text-sm">
                {shop.missing.length === 0
                  ? "✅ Likely has everything"
                  : `⚠️ Might not have: ${shop.missing.map((i) => i.name).join(", ")}`}
              </p>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}&travelmode=walking`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-leaf hover:underline"
              >
                Directions →
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ShopMap;
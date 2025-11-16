import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Navigation, Clock, ExternalLink } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface GroceryStore {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  opening_hours?: {
    open_now: boolean;
  };
  formatted_phone_number?: string;
}

interface GroceryStoreScreenProps {
  onBack: () => void;
}

export default function GroceryStoreScreen({ onBack }: GroceryStoreScreenProps) {
  const [stores, setStores] = useState<GroceryStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchNearbyGroceryStores = async (location: { lat: number; lng: number }) => {
    try {
      // console.log("[GROCERY] Fetching stores for location:", location);
      const url = `http://localhost:8080/api/nearby-stores`;
      // console.log("[GROCERY] API URL:", url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng
        })
      });
      
      // console.log("[GROCERY] Response status:", response.status);
      // console.log("[GROCERY] Response ok:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[GROCERY] Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      // console.log("[GROCERY] Response data:", data);
      // console.log("[GROCERY] Data status:", data.status);
      // console.log("[GROCERY] Number of results:", data.results?.length || 0);
      
      if (data.results && data.results.length > 0) {
        // console.log("[GROCERY] Setting stores:", data.results.length);
        setStores(data.results.slice(0, 10)); // Get top 10 stores
      } else {
        // console.warn("[GROCERY] No results found in response");
        setError("No grocery stores found nearby.");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("[GROCERY] Error fetching grocery stores:", err);
      // console.error("[GROCERY] Error details:", {
      //   message: err instanceof Error ? err.message : String(err),
      //   stack: err instanceof Error ? err.stack : undefined
      // });
      setError(`Failed to fetch grocery stores: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    // console.log("[GROCERY] Component mounted, requesting location");
    // Get user's current location
    if (navigator.geolocation) {
      // console.log("[GROCERY] Geolocation API available");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // console.log("[GROCERY] Location received:", position.coords);
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          // console.log("[GROCERY] Parsed location:", location);
          setUserLocation(location);
          fetchNearbyGroceryStores(location);
        },
        (error) => {
          console.error("[GROCERY] Error getting location:", error);
          // console.error("[GROCERY] Error code:", error.code);
          // console.error("[GROCERY] Error message:", error.message);
          setError(`Unable to get your location: ${error.message}. Please enable location services.`);
          setLoading(false);
        }
      );
    } else {
      console.error("[GROCERY] Geolocation not supported");
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959; // Radius of Earth in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const openInGoogleMaps = (store: GroceryStore) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      store.name
    )}&query_place_id=${store.place_id}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-white">Nearby Grocery Stores</h1>
            <p className="text-white/80 mt-1">Find stores near you</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Finding stores near you...</p>
          </div>
        )}

        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <MapPin className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="text-gray-900 mb-1">Location Error</h4>
                <p className="text-gray-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {!loading && !error && stores.length === 0 && (
          <Card className="p-6 bg-white">
            <div className="flex flex-col items-center justify-center text-center py-8">
              <MapPin className="text-gray-400 mb-4" size={48} />
              <h4 className="text-gray-900 mb-2">No Stores Found</h4>
              <p className="text-gray-600">
                We couldn't find any grocery stores near your location.
              </p>
            </div>
          </Card>
        )}

        {!loading && !error && stores.length > 0 && (
          <div className="space-y-3">
            {stores.map((store) => (
              <Card
                key={store.place_id}
                className="p-4 bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => openInGoogleMaps(store)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{store.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin size={16} className="flex-shrink-0" />
                      <span className="text-sm">{store.vicinity}</span>
                    </div>
                  </div>
                  <ExternalLink className="text-blue-600 flex-shrink-0 ml-2" size={20} />
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  {userLocation && (
                    <div className="flex items-center gap-1 text-gray-700">
                      <Navigation size={16} className="text-blue-600" />
                      <span className="text-sm">
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          store.geometry.location.lat,
                          store.geometry.location.lng
                        )}{" "}
                        mi
                      </span>
                    </div>
                  )}

                  {store.rating && (
                    <div className="flex items-center gap-1 text-gray-700">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm">{store.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {store.opening_hours && (
                    <div className="flex items-center gap-1">
                      <Clock size={16} className="text-green-600" />
                      <span
                        className={`text-sm ${
                          store.opening_hours.open_now
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {store.opening_hours.open_now ? "Open now" : "Closed"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInGoogleMaps(store);
                    }}
                  >
                    <Navigation size={16} className="mr-2" />
                    Get Directions
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

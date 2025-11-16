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
      // Mock data for demonstration - In production, you'd call a backend endpoint
      // that uses Google Places API server-side to avoid CORS issues
      
      const mockStores: GroceryStore[] = [
        {
          place_id: "1",
          name: "Whole Foods Market",
          vicinity: "123 Main St, Atlanta, GA",
          geometry: {
            location: {
              lat: location.lat + 0.01,
              lng: location.lng + 0.01,
            },
          },
          rating: 4.5,
          opening_hours: { open_now: true },
        },
        {
          place_id: "2",
          name: "Kroger",
          vicinity: "456 Oak Ave, Atlanta, GA",
          geometry: {
            location: {
              lat: location.lat + 0.02,
              lng: location.lng - 0.01,
            },
          },
          rating: 4.2,
          opening_hours: { open_now: true },
        },
        {
          place_id: "3",
          name: "Publix Super Market",
          vicinity: "789 Pine Rd, Atlanta, GA",
          geometry: {
            location: {
              lat: location.lat - 0.015,
              lng: location.lng + 0.02,
            },
          },
          rating: 4.6,
          opening_hours: { open_now: false },
        },
        {
          place_id: "4",
          name: "Trader Joe's",
          vicinity: "321 Elm St, Atlanta, GA",
          geometry: {
            location: {
              lat: location.lat + 0.025,
              lng: location.lng + 0.015,
            },
          },
          rating: 4.7,
          opening_hours: { open_now: true },
        },
        {
          place_id: "5",
          name: "Sprouts Farmers Market",
          vicinity: "654 Maple Dr, Atlanta, GA",
          geometry: {
            location: {
              lat: location.lat - 0.01,
              lng: location.lng - 0.02,
            },
          },
          rating: 4.4,
          opening_hours: { open_now: true },
        },
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setStores(mockStores);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching grocery stores:", err);
      setError("Failed to fetch grocery stores. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          fetchNearbyGroceryStores(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to get your location. Please enable location services.");
          setLoading(false);
        }
      );
    } else {
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

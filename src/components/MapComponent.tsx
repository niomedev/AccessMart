import React, { useState, useEffect, useRef } from 'react';
import {
  E_SDK_EVENT,
  Mappedin,
  MapView,
  OfflineSearch,
  showVenue,
  getVenueMaker,
  MappedinLocation,
  TMappedinOfflineSearchResult,
  TGetVenueMakerOptions
} from "@mappedin/mappedin-js";
import productData from "../../public/products.json";
interface Product {
  name: string | null;
  description: string | null;
  price: string | number | null;
  location: string | null;
}

const MapComponent: React.FC = () => {
  console.log(productData);

  const [venue, setVenue] = useState<Mappedin | null>(null);
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [search, setSearch] = useState<OfflineSearch | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const searchElementRef = useRef<HTMLInputElement>(null);

  const navigateTo = (to: MappedinLocation) => {
    if (!mapView || !venue) return;
    const from = venue.locations.find(l => l.name === "Entrance");
    if (!from) return;
    const directions = from.directionsTo(to);
    mapView.Journey.draw(directions, {
      pathOptions: {
        nearRadius: 0.5,
        farRadius: 0.7
      }
    });
  };

  useEffect(() => {
    const init = async () => {
      const options: TGetVenueMakerOptions = {
        mapId: process.env.REACT_APP_MAP_ID!,
        key: process.env.REACT_APP_KEY!,
        secret: process.env.REACT_APP_SECRET!,
      };
      const loadedVenue = await getVenueMaker(options);
      const loadedMapView = await showVenue(document.getElementById("map")!, loadedVenue);
      const loadedSearch = new OfflineSearch(loadedVenue);

      setVenue(loadedVenue);
      setMapView(loadedMapView);
      setSearch(loadedSearch);

      loadedMapView.on(E_SDK_EVENT.CLICK, () => setSearchResults([]));
    };

    productData.forEach((product: Product) => {
      if (product.location) {
        search.addQuery({
          query: product.name || "",
          object: { product },
        });
      }
    });

    console.log(search);

    init();
  }, []);

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    if (query.length < 2 || !search) {
      setSearchResults([]);
      return;
    }

    const results: TMappedinOfflineSearchResult[] = await search.search(query);
    const productResults: Product[] = results
      .filter(r => r.type === "Custom" && "object" in r)
      .map(r => r.object as unknown as Product);

    setSearchResults(productResults);
  };

  return (
    <div className="App">
      <div id="search-bar">
        <input
          type="search"
          placeholder="Search for a product"
          ref={searchElementRef}
          onChange={handleSearch}
        />
        <div id="search-results">
          <ul id="search-results-list">
            {searchResults.map((product, index) => (
              <li
                key={index}
                onClick={() => {
                  if (product.location && venue) {
                    const destination = venue.locations.find(p => p.name === product.location);
                    if (destination) {
                      navigateTo(destination);
                    }
                  }
                }}
              >
                {product.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div id="map" style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
};

export default MapComponent;

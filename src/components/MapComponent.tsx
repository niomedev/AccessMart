import React, { useState, useEffect, useRef } from 'react';
import {
  E_SDK_EVENT,
  Mappedin,
  MapView,
  OfflineSearch,
  showVenue,
  TGetVenueMakerOptions,
  TMappedinOfflineSearchResult,
  getVenueMaker,
  MappedinLocation
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";
import productData from "../../public/products.json";
import { Product } from '../interface';
import { navigateTo } from '../utils';
import './MapComponent.css';

const MapComponent: React.FC = () => {
  const [venue, setVenue] = useState<Mappedin | null>(null);
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  
  const searchRef = useRef<OfflineSearch | null>(null);
  const searchElementRef = useRef<HTMLInputElement>(null);
  const resultsElementRef = useRef<HTMLDivElement>(null);
  const resultsListElementRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const init = async () => {
      const options: TGetVenueMakerOptions = {
        mapId: process.env.REACT_APP_MAP_ID!,
        key: process.env.REACT_APP_KEY!,
        secret: process.env.REACT_APP_SECRET!,
      };
      const loadedVenue = await getVenueMaker(options);
      const loadedMapView = await showVenue(document.getElementById("map")!, loadedVenue);

      setVenue(loadedVenue);
      setMapView(loadedMapView);

      loadedMapView.on(E_SDK_EVENT.CLICK, () => {
        if (resultsElementRef.current) {
          resultsElementRef.current.style.display = "none";
        }
      });

      searchRef.current = new OfflineSearch(loadedVenue);

      productData.forEach((product: Product) => {
        if (product.location && searchRef.current) {
          searchRef.current.addQuery({
            query: product.name,
            object: { product }
          });
        }
      });
    };

    init();
  }, []);

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    if (!query || query.length < 2 || !searchRef.current) {
      setSearchResults([]);
      return;
    }

    setSearchResults([]);

    const results: TMappedinOfflineSearchResult[] = await searchRef.current.search(query);
    const productResults = results
      .filter(r => r.type === "Custom" && "object" in r && "product" in r.object)
      .map(r => (r.object as any).product as Product);

    setSearchResults(productResults);
  };

  const handleResultClick = (product: Product) => {
    if (product.location) {
      navigateTo(mapView, venue, product.location);
      if (searchElementRef.current) {
        searchElementRef.current.value = product.name || "";
      }
    }
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
        <div id="search-results" ref={resultsElementRef}>
          <ul id="search-results-list" ref={resultsListElementRef}>
            {searchResults.map((product, index) => (
              <li key={index} onClick={() => handleResultClick(product)}>
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

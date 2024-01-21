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
  CAMERA_EASING_MODE
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";
import productData from "../../public/products.json";
import { Product } from '../interface';
import { navigateTo } from '../utils';
import './MapComponent.css';
import Select from 'react-select';

const MapComponent: React.FC = () => {
  const [venue, setVenue] = useState<Mappedin | null>(null);
  const [mapView, setMapView] = useState<MapView | null>(null);
  const searchRef = useRef<OfflineSearch | null>(null);
  const [options, setOptions] = useState<{ value: Product, label: string }[]>([]);

  useEffect(() => {
    const init = async () => {
      const options: TGetVenueMakerOptions = {
        mapId: process.env.REACT_APP_MAP_ID!,
        key: process.env.REACT_APP_KEY!,
        secret: process.env.REACT_APP_SECRET!,
      };
      const loadedVenue = await getVenueMaker(options);
      const loadedMapView = await showVenue(document.getElementById("map")!, loadedVenue);
      loadedMapView.Camera.interactions.set({ zoom: false, rotationAndTilt: false, pan: false});
      loadedMapView.Camera.animate(
        {
          tilt: 0,
          rotation: 0,
          zoom: 1
        },
        {
          duration: 3000,
          easing: CAMERA_EASING_MODE.EASE_OUT
        }
      );
      setVenue(loadedVenue);
      setMapView(loadedMapView);

      loadedMapView.on(E_SDK_EVENT.CLICK, () => {
        setOptions([]);
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

  const performSearch = async (query: string) => {
    if (!query || query.length < 2 || !searchRef.current) {
      setOptions([]);
      return;
    }

    const results: TMappedinOfflineSearchResult[] = await searchRef.current.search(query);
    const formattedOptions = results
      .filter(r => r.type === "Custom" && "object" in r && "product" in r.object)
      .map(r => {
        const product = (r.object as any).product as Product;
        return { value: product, label: product.name };
      });

    setOptions(formattedOptions);
  };

  const handleSearchChange = (inputValue: string) => {
    performSearch(inputValue);
  };

  const handleSelectChange = (selectedOption: { value: Product, label: string } | null) => {
    if (selectedOption && selectedOption.value.location) {
      navigateTo(mapView, venue, selectedOption.value.location);
    }
  };

  return (
    <div className="App">
      <div id="search-bar">
        <Select
          options={options}
          onInputChange={handleSearchChange}
          onChange={handleSelectChange}
          placeholder="Search for a product"
          isClearable
        />
      </div>
      <div id="map" className="unclickable" style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
};

export default MapComponent;
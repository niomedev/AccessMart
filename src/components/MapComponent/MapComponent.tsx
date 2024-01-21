import React, { useState, useEffect, useRef } from 'react';
import Select, { MultiValue } from 'react-select';
import {
  E_SDK_EVENT,
  Mappedin,
  MapView,
  OfflineSearch,
  showVenue,
  TGetVenueMakerOptions,
  TMappedinOfflineSearchResult,
  getVenueMaker,
  CAMERA_EASING_MODE,
  MappedinLocation,
  MappedinDestinationSet
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";
import { Product, MapComponentProps } from '../../interface';
import './MapComponent.css';

const MapComponent: React.FC<MapComponentProps> = ({ productData }) => {
  const [venue, setVenue] = useState<Mappedin | null>(null);
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [options, setOptions] = useState<{ value: Product, label: string }[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const searchRef = useRef<OfflineSearch | null>(null);

  useEffect(() => {
    const init = async () => {
      const mappedinOptions: TGetVenueMakerOptions = {
        mapId: process.env.REACT_APP_MAP_ID!,
        key: process.env.REACT_APP_KEY!,
        secret: process.env.REACT_APP_SECRET!,
      };
      const loadedVenue = await getVenueMaker(mappedinOptions);
      const loadedMapView = await showVenue(document.getElementById("map")!, loadedVenue, {
        backgroundColor: "#AFE1AF",
      });

      loadedMapView.on(E_SDK_EVENT.OUTDOOR_VIEW_LOADED, () => {
        console.log("Map loaded");
      });
      loadedMapView.Camera.interactions.set({ zoom: false, rotationAndTilt: false, pan: false});
      loadedMapView.Camera.animate(
        { tilt: 0, rotation: 0, zoom: 1 },
        { duration: 3000, easing: CAMERA_EASING_MODE.EASE_OUT }
      );
      
      setVenue(loadedVenue);
      setMapView(loadedMapView);

      loadedMapView.on(E_SDK_EVENT.CLICK, () => setOptions([]));
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
  }, [productData]);

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

  const handleSelectChange = (selectedOptions: MultiValue<{ value: Product, label: string }>) => {
    const products = selectedOptions.map(option => option.value);
    setSelectedProducts(products);
  };

  useEffect(() => {
    if (!mapView || !venue || selectedProducts.length === 0) {
      return;
    }

    const startLocation = venue.locations.find(l => l.name === "Entrance");
    if (!startLocation) {
      console.error("Start location not found");
      return;
    }

    const destinations = selectedProducts.map(product => {
      return venue.locations.find(l => l.name === product.location);
    }).filter(Boolean) as MappedinLocation[];

    if (destinations.length > 0) {
      const directions = startLocation.directionsTo(new MappedinDestinationSet(destinations), 
        { 
          simplify: {
            enabled: true,
          },
          accessible: true
        }
      );
      console.log(destinations[0]);
      mapView.Journey.draw(directions, {
        pathOptions: {
          nearRadius: 0.3,
          farRadius: 0.5,
          flattenPath: true
        },
        inactivePathOptions: {
          nearRadius: 0.3,
          farRadius: 0.5,
          flattenPath: true
        },
        
      });
    }
  }, [selectedProducts, mapView, venue]);

  return (
    <div className="App">
      <div className="map-container">
        <div id="search-bar">
          <Select
            options={options}
            onChange={handleSelectChange}
            onInputChange={handleSearchChange}
            placeholder="Search..."
            isMulti
            isClearable
            classNamePrefix="react-select"
          />
        </div>
        <div id="map" className="unclickable" />
      </div>
    </div>
  );
};

export default MapComponent;

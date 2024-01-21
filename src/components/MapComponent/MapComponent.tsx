import React, { useState, useEffect, useRef } from 'react';
import Select, { MultiValue } from 'react-select';
import {
  Mappedin,
  MapView,
  OfflineSearch,
  showVenue,
  TGetVenueMakerOptions,
  getVenueMaker,
  CAMERA_EASING_MODE,
  MappedinLocation,
  MappedinDestinationSet
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";
import { Product, MapComponentProps, Store } from '../../interface';
import './MapComponent.css';

const MapComponent: React.FC<MapComponentProps> = ({ storeData }) => {
  const [venue, setVenue] = useState<Mappedin | null>(null);
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(
    storeData.length > 0 ? storeData[0] : null
  );
  const [options, setOptions] = useState<{ value: Product, label: string }[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const searchRef = useRef<OfflineSearch | null>(null);

  const storeOptions = storeData.map(store => ({
    value: store,
    label: store.storeName
  }));

  useEffect(() => {
    const init = async () => {
        if(!selectedStore) return;

        if (mapView && venue) {
            mapView.destroy();
            venue.destroy();
            setMapView(null);
        }

        setSelectedProducts([]);
        setOptions([]);

        const mappedinOptions: TGetVenueMakerOptions = {
            mapId: selectedStore.mapId,
            key: process.env.REACT_APP_KEY!,
            secret: process.env.REACT_APP_SECRET!,
        };
        
        const loadedVenue = await getVenueMaker(mappedinOptions);
        const loadedMapView = await showVenue(document.getElementById("map")!, loadedVenue, {
            backgroundColor: "#AFE1AF",
        });

        loadedMapView.Camera.interactions.set({ zoom: false, rotationAndTilt: false, pan: false});
        loadedMapView.Camera.animate(
            { tilt: 0, rotation: 0, zoom: 1 },
            { duration: 3000, easing: CAMERA_EASING_MODE.EASE_OUT }
        );
        
        setVenue(loadedVenue);
        setMapView(loadedMapView);
    };
    init();
  }, [selectedStore]);

    useEffect(() => {
        if (!selectedStore) return;

        if (venue) {
            searchRef.current = new OfflineSearch(venue);
            setOptions([]);
            selectedStore.products.forEach(product => {
                searchRef.current?.addQuery({
                    query: product.name,
                    object: { product }
                });
            });
        }

        const newOptions = selectedStore.products.map(product => ({
            value: product,
            label: product.name
        }));
        
        setOptions(newOptions);
        setSelectedProducts([]);
    }, [selectedStore, venue]);



  const handleStoreChange = (selectedOption: { value: Store, label: string } | null) => {
    setSelectedStore(selectedOption?.value || null);
  };

  const performSearch = async (query: string) => {
    if (!selectedStore) {
        setOptions([]);
        return;
    }

    let filteredProducts;
    if (query.length > 2) {
        filteredProducts = selectedStore.products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase())
        );
    } else {
        filteredProducts = selectedStore.products;
    }

    const formattedOptions = filteredProducts.map(product => ({
        value: product,
        label: product.name
    }));

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
    <div className="selectors-container">
      <div id="store-selector">
        <Select
            options={storeOptions}
            onChange={handleStoreChange}
            placeholder="Select a Store"
            isClearable
            classNamePrefix="react-select"
            value={selectedStore ? { value: selectedStore, label: selectedStore.storeName } : null}
        />
      </div>
      <div id="search-bar">
        <Select
            options={options}
            onChange={handleSelectChange}
            onInputChange={handleSearchChange}
            placeholder="Search for products..."
            isMulti
            isClearable
            isDisabled={!selectedStore}
            classNamePrefix="react-select"
        />
      </div>
    </div>
    <div id="map" className="unclickable" />
  </div>
</div>
  );
};

export default MapComponent;

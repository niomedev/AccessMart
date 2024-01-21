export interface Product {
    name: string;
    description: string | null;
    price: number | string | null;
    location: string;
  }

export interface Store {
    mapId: string;
    products: Product[];
    storeAddress:{
        city: string;
        country: string;
        province: string;
        street: string;
    }
    storeId: number;
    storeName: string;
}
export interface SearchResult {
    type: string;
    object: {
      product: Product;
    };
  }

export interface MapComponentProps {
    storeData: Store[];
}

export interface Location {
    name: string;
    distances: Record<string, number>;
  }
  
export type PathWithDistance = {
    path: string[];
    totalDistance: number;
  };
  
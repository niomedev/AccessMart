export interface Product {
    name: string;
    description: string | null;
    price: number | string | null;
    location: string;
  }

export interface SearchResult {
    type: string;
    object: {
      product: Product;
    };
  }

export interface MapComponentProps {
    productData: Product[];
}
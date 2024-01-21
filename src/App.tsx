// App.tsx
import React from 'react';
import MapComponent from './components/MapComponent';
import productData from '../public/products.json'; // Import the product data

function App() {
  return (
    <div className="App">
      <MapComponent productData={productData} />
    </div>
  );
}

export default App;

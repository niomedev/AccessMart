import React, { useEffect, useState } from 'react';
import MapComponent from './components/MapComponent/MapComponent'; 
import './App.css'; 
import './globals.css';
import { db, analytics } from './services/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Store } from './interface';

const App = () => {
    const [stores, setStores] = useState<Store[]>([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "stores"));
          const storesData: Store[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as Store;
            storesData.push({ ...data, storeId: doc.id as unknown as number });
          });
          setStores(storesData);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      };
  
        fetchData();
    }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src='https://cdn.discordapp.com/attachments/1196613165920813096/1198392945141874819/nwhacks-removebg-preview_1.png' className="App-logo" alt="logo" />
        <nav>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </header>
      
      <main>
        
        <section className="Hero-section">
          <h1>AccesSMart</h1>
          <p>Find and plan your journey around a variety of stores using AccesSMart!</p>
          {/* <button>Start Exploring</button> */}
        </section>

        <MapComponent storeData={stores}/>
        <section id="features" className="Features-section">
          <div className="feature">
            <h1>Feature</h1>
            <p>Feature description</p>
          </div>
          <div className="feature">
            <h1>Feature</h1>
            <p>Feature description</p>
          </div>
          <div className="feature">
            <h1>Feature</h1>
            <p>Feature description</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

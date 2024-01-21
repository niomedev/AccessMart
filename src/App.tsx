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
          console.log(storesData);
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
          <h1>Welcome to Our Mapping App</h1>
          <p>Find locations and plan your journey easily.</p>
          <button>Start Exploring</button>
        </section>

        <MapComponent storeData={stores}/>

        <section id="features" className="Features-section">
          <h2>Key Features</h2>
          <div className="feature">Feature 1</div>
          <div className="feature">Feature 2</div>
          <div className="feature">Feature 3</div>
        </section>

        <section id="about" className="About-section">
          <h2>About Our App</h2>
          <p>This app helps users to find XYZ...</p>
        </section>

        <section className="Testimonials-section">
          <h2>What Our Users Say</h2>
          <blockquote>"This app is amazing!" - User A</blockquote>
        </section>
      </main>

      <footer className="App-footer">
        <section id="contact" className="Contact-section">
          <h2>Contact Us</h2>
          <p>Email: contact@example.com</p>
        </section>

        <section className="Footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Use</a>
        </section>
      </footer>
    </div>
  );
}

export default App;

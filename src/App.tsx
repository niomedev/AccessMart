import React from 'react';
import MapComponent from './components/MapComponent/MapComponent'; 
import './App.css'; 
import productData from '../public/products.json';
import './globals.css';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src="/logo.png" className="App-logo" alt="logo" />
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

        <MapComponent productData={productData}/>

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

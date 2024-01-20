import React, {useState, useEffect, useRef} from 'react';
import './App.css';
import {
  E_SDK_EVENT,
  getVenue,
  Mappedin,
  MappedinPolygon,
  MapView,
  OfflineSearch,
  showVenue,
  TGetVenueOptions,
  TMappedinOfflineSearchResult
} from "@mappedin/mappedin-js";
import { augmentedPolygonThings } from "./defaultThings";
import productData from "./products.json";
import "@mappedin/mappedin-js/lib/mappedin.css";


function App() {

  // const [initRan, setInitRan] = useState(false);

  const options: TGetVenueOptions = {
    venue: "mappedin-demo-retail-2",
    clientId: "5eab30aa91b055001a68e996",
    clientSecret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1",
    things: augmentedPolygonThings // ensures polygon name is fetched
  };

  let venue: Mappedin;
  let mapView: MapView;
  let search: OfflineSearch;

  // const resultsElement = document.getElementById("search-results")!;
  // const resultsListElement = document.getElementById("search-results-list")!;
  // const searchElement = document.getElementById("search-bar")!;
  const resultsElementRef = useRef<HTMLDivElement>(null);
  const resultsListElementRef = useRef<HTMLUListElement>(null);
  const searchElementRef = useRef<HTMLInputElement>(null);

  function navigateTo(to: MappedinPolygon) {
    if (!mapView) return;
    const from = venue.locations.find((l) => l.name === "Entrance")!;
    const directions = from.directionsTo(to);
    mapView.Journey.draw(directions, {
      pathOptions: {
        nearRadius: 0.5,
        farRadius: 0.7
      }
    });
  }

  interface Product {
    name: string | null;
    description: string | null;
    price: string | number | null;
    polygonName: string | null;
  }

  async function init() {
    if (!mapView || !venue || !search) {
      venue = await getVenue(options);
      search = new OfflineSearch(venue);
      mapView = await showVenue(document.getElementById("map")!, venue);
    }
    else return;

    console.log("running init")

    const searchElement = searchElementRef.current; 
    const resultsElement = resultsElementRef.current;
    const resultsListElement = resultsListElementRef.current;
    if(searchElement && resultsElement && resultsListElement) {
      mapView.on(E_SDK_EVENT.CLICK, (_payload) => {
        resultsElement.style.display = "none";
      });

      productData.forEach((product: Product) => {
        if (product.polygonName) {
          search.addQuery({
            query: product.name || "",
            object: {
              name : product.name,
              description: product.description,
              price: Number(product.price),
              polygonName: product.polygonName
            }
          });
        }
      });
      
      searchElement.oninput = async (event: Event) => {
        const query = (event.target as HTMLInputElement).value;

        if (query.length < 2) {
          resultsElement.style.display = "none";
          resultsListElement.innerHTML = "";
          return;
        }
        const results: TMappedinOfflineSearchResult[] = await search.search(query);
        const productResults = results.filter((r) => r.type === "Custom");

        resultsListElement.innerHTML = "";

        if (productResults.length === 0) {
          resultsElement.style.display = "none";
          return;
        }

        productResults.forEach((result: TMappedinOfflineSearchResult) => {
          // console.log(result);
          const product = ("object" in result) ? result.object as unknown as Product : null;

          if (!product) return;

          const resultElement = document.createElement("li");
          resultElement.innerText = product?.name ?? "";
          if (product !== null && product.polygonName !== null) {
            resultElement.dataset.id = product.polygonName;
          }
          resultsListElement.appendChild(resultElement);

          resultElement.addEventListener("click", (event: MouseEvent) => {
            mapView.Journey.clear();
            const id = (event.target as HTMLLIElement).dataset.id;
            const destination =  venue.polygons.find((p) => p.name === id)!;
            navigateTo(destination);
            resultsElement.style.display = "none";
            if (product) {
              const searchElement = document.getElementById("search") as HTMLInputElement;
              searchElement.value = product.name ?? "";
            }
          });
        });

        resultsElement.style.display = "block";
      };

      // initial sample product search
      const product = productData[1]; // Pasta Sauce
      const destination = venue.polygons.find(
        (p) => p.name === product.polygonName
      )!;
      navigateTo(destination);
      resultsElement.style.display = "none";
      searchElement.nodeValue = product.name;
    }
  }

    // useEffect(() => {
    //   if (!initRan) {
    //     init();
    //     setInitRan(true);
    //   }
  // }, []);
  
  init();

  return (
    <div className="App">
      {/* <div id="Map" style={{ width: "100%", height: "100%" }}></div> */}
      <div id="search-bar">
        <input type="search" placeholder="Search for a product" id="search" ref={searchElementRef}/>
        <div id="search-results"ref={resultsElementRef}>
          <ul id="search-results-list"ref={resultsListElementRef}></ul>
        </div>
      </div>
      <div id="map"></div>
    </div>
  );
}

export default App;

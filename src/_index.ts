import {
  E_SDK_EVENT,
  Mappedin,
  MapView,
  OfflineSearch,
  showVenue,
  TGetVenueMakerOptions,
  TMappedinOfflineSearchResult,
  getVenueMaker,
  MappedinLocation
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";
import productData from "../public/products.json";

const options = {
  mapId: process.env.REACT_APP_MAP_ID,
  key: process.env.REACT_APP_KEY,
  secret: process.env.REACT_APP_SECRET,
} as TGetVenueMakerOptions;


let venue: Mappedin;
let mapView: MapView;
let search: OfflineSearch;

const resultsElement = document.getElementById("search-results") as HTMLDivElement;
const resultsListElement = document.getElementById("search-results-list")! as HTMLUListElement;
const searchElement = document.getElementById("search")! as HTMLInputElement;

function navigateTo(to: MappedinLocation) {
  if (!mapView) return;
  const from = venue.locations.find((l) => l.name == "Entrance")!;
  const directions = from.directionsTo(to);
  mapView.Journey.draw(directions, {
    pathOptions: {
      nearRadius: 0.5,
      farRadius: 0.7
    }
  });
}

interface Product {
  name: string;
  description: string | null;
  price: number | string | null;
  location: string;
}


async function init() {
  venue = await getVenueMaker(options);
  search = new OfflineSearch(venue);
  mapView = await showVenue(document.getElementById("map")!, venue);

  mapView.on(E_SDK_EVENT.CLICK, (_payload) => {
    resultsElement.style.display = "none";
  });

  productData.forEach((product: Product) => {
    if (product.location) {
      search.addQuery({
        query: product.name,
        object: { product }
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
      if ("product" in result.object) {
        const product = result.object.product as Product;

        const resultElement = document.createElement("li");
        resultElement.innerText = product.name;
        resultElement.dataset.id = product.location;
        resultsListElement.appendChild(resultElement);

        resultElement.addEventListener("click", (event: MouseEvent) => {
          mapView.Journey.clear();
          const id = (event.target as HTMLLIElement).dataset.id;
          const destination = venue.locations.find((p) => p.name === product.location)!;
          navigateTo(destination);
          resultsElement.style.display = "none";
          searchElement.value = product.name;
        });
      }
    });

    resultsElement.style.display = "block";
  };

  const product = productData[0]; 
  const destination = venue.locations.find(
    (p) => p.name === product.location
  )! as MappedinLocation;
  navigateTo(destination);
  searchElement.value = product.name;
}

init();

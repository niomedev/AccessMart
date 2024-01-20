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
import "@mappedin/mappedin-js/lib/mappedin.css";
import { augmentedPolygonThings } from "./defaultThings";
import productData from "../public/products.json";

// See Trial API key Terms and Conditions
// https://developer.mappedin.com/guides/api-keys
const options: TGetVenueOptions = {
  venue: "mappedin-demo-retail-2",
  clientId: "5eab30aa91b055001a68e996",
  clientSecret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1",
  things: augmentedPolygonThings // ensures polygon name is fetched
};

let venue: Mappedin;
let mapView: MapView;
let search: OfflineSearch;

const resultsElement = document.getElementById("search-results")!;
const resultsListElement = document.getElementById("search-results-list")!;
const searchElement = document.getElementById("search")!;

function navigateTo(to: MappedinPolygon) {
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
  description: string;
  price: number;
  polygonName: string;
}

async function init() {
  venue = await getVenue(options);
  search = new OfflineSearch(venue);
  mapView = await showVenue(document.getElementById("map")!, venue);

  mapView.on(E_SDK_EVENT.CLICK, (_payload) => {
    resultsElement.style.display = "none";
  });

  productData.forEach((product: Product) => {
    if (product.polygonName) {
      search.addQuery({
        query: product.name,
        object: { product }
      });
    }
  });

  searchElement.oninput = async (event: Event) => {
    const query = event.target.value;

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
      const product = result.object.product as Product;

      const resultElement = document.createElement("li");
      resultElement.innerText = product.name;
      resultElement.dataset.id = product.polygonName;
      resultsListElement.appendChild(resultElement);

      resultElement.addEventListener("click", (event: MouseEvent) => {
        mapView.Journey.clear();
        const id = (event.target as HTMLLIElement).dataset.id;
        const destination = venue.polygons.find((p) => p.name === id)!;
        navigateTo(destination);
        resultsElement.style.display = "none";
        searchElement.value = product.name;
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
  searchElement.value = product.name;
}

init();

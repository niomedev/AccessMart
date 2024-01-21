import { Mappedin, MapView, MappedinLocation } from "@mappedin/mappedin-js";
import { PathWithDistance, Location } from "./interface";

export const navigateTo = (mapView: MapView | null, venue: Mappedin | null, toLocation: string) => {
  if (!mapView || !venue) return;
  const from = venue.locations.find(l => l.name === "Entrance");
  const to = venue.locations.find(l => l.name === toLocation);
  if (from && to) {
    const directions = from.directionsTo(to as MappedinLocation, { accessible: true });
    mapView.Journey.draw(directions, {
      pathOptions: {
        nearRadius: 0.3,
        farRadius: 0.5,
        flattenPath: true
      }
    });
  }
};

export function permute<T>(permutation: T[]): T[][] {
    let length = permutation.length,
    result = [permutation.slice()],
    c = new Array(length).fill(0),
    i = 1, k, p;

    while (i < length) {
    if (c[i] < i) {
        k = i % 2 * c[i];
        p = permutation[i];
        permutation[i] = permutation[k];
        permutation[k] = p;
        ++c[i];
        i = 1;
        result.push(permutation.slice());
    } else {
        c[i] = 0;
        ++i;
    }
    }
    return result;
}
  

  
export function solveTSP(locations: Location[]): PathWithDistance {
    const locationNames = locations.map(loc => loc.name);
    let minPath: string[] = [];
    let minPathLength = Number.MAX_VALUE;
  
    const allPaths = permute(locationNames.slice(1));
  
    allPaths.forEach(path => {
      let pathLength = 0;
      let currentLocation = locationNames[0];
  
      for (const nextLocation of path) {
        pathLength += locations.find(loc => loc.name === currentLocation)?.distances[nextLocation] ?? 0;
        currentLocation = nextLocation;
      }
  
      pathLength += locations.find(loc => loc.name === currentLocation)?.distances[locationNames[0]] ?? 0;
  
      if (pathLength < minPathLength) {
        minPathLength = pathLength;
        minPath = [locationNames[0], ...path];
      }
    });
  
    return { path: minPath, totalDistance: minPathLength };
  }
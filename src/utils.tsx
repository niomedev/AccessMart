import { Mappedin, MapView, MappedinLocation } from "@mappedin/mappedin-js";

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

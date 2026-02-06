// const Listing = require("../../models/listing");

mapboxgl.accessToken = mapToken;
console.log(mapToken);
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard', // Use the standard style for the map
    projection: 'globe', // display the map as a globe
    zoom: 9, // initial zoom level, 0 is the world view, higher values zoom in
    center: listing.geometry.coordinates // center the map on this longitude and latitude
});     
// Create a new marker.
// console.log(coordinates);
const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h5><b>${listing.location}</b><h5><p>Exact Location after booking</p>`
    );
const marker = new mapboxgl.Marker({
        color: "red",
        draggable: false
    })
    .setLngLat( listing.geometry.coordinates)
    .setPopup(popup)
    .addTo(map);               
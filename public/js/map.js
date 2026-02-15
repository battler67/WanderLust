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

const iconEl = document.createElement("div");
iconEl.innerHTML = '<i class="fa-solid fa-building-columns"></i>';

iconEl.style.fontSize = "30px";
iconEl.style.color = "#e63946";  // Airbnb-ish red
iconEl.style.cursor = "pointer";

const marker = new mapboxgl.Marker({
        color: "red",
        draggable: false
    })
    .setLngLat( listing.geometry.coordinates)
    .setPopup(popup)
    .addTo(map);      
const size = 200;
const pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),

        // When the layer is added to the map,
        // get the rendering context for the map canvas.
        onAdd: function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
        },

        // Call once before every frame where the icon will be used.
        render: function () {
            const duration = 1000;
            const t = (performance.now() % duration) / duration;

            const radius = (size / 2) * 0.3;
            const outerRadius = (size / 2) * 0.7 * t + radius;
            const context = this.context;

            // Draw the outer circle.
            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                outerRadius,
                0,
                Math.PI * 2
            );
            context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
            context.fill();

            // Draw the inner circle.
            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                radius,
                0,
                Math.PI * 2
            );
            context.fillStyle = 'rgba(255, 100, 100, 1)';
            context.strokeStyle = 'white';
            context.lineWidth = 2 + 4 * (1 - t);
            context.fill();
            context.stroke();

            // Update this image's data with data from the canvas.
            this.data = context.getImageData(
                0,
                0,
                this.width,
                this.height
            ).data;

            // Continuously repaint the map, resulting
            // in the smooth animation of the dot.
            map.triggerRepaint();

            // Return `true` to let the map know that the image was updated.
            return true;
        }
    };
map.on("load", () => {
    map.addSource("user-radius", {
    type: "geojson",
    data: {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: listing.geometry.coordinates
        }
        }
    }); 
    map.addLayer({
        id: "user-radius-layer",
        type: "circle",
        source: "user-radius",
        paint: {
        "circle-radius": {
            stops: [
            [10, 40],
            [14, 120],
            [18, 300]
            ]
        },
        "circle-color": "#e63946",
        "circle-opacity": 0.2,
        "circle-stroke-color": "#e63946",
        "circle-stroke-width": 1
        }
    });

    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

        map.addSource('dot-point', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates':  listing.geometry.coordinates// icon position [lng, lat]
                        }
                    }
                ]
            }
        });
        map.addLayer({
            'id': 'layer-with-pulsing-dot',
            'type': 'symbol',
            'source': 'dot-point',
            'layout': {
                'icon-image': 'pulsing-dot'
            }
        });
});

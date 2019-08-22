// Scroll to top of the page on reload
window.onbeforeunload = function () {
	window.scrollTo(0, 0);
}

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
	scrollFunction()
};

function scrollFunction() {
	if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
		document.getElementById("myBtn").style.display = "block";
	} else {
		document.getElementById("myBtn").style.display = "none";
	}
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;

	// Reset map container
	document.getElementById('mapbox').innerHTML = '<div id="map"></div>';
}

// Retrieve selected eqarthquake url
var dropdown = document.getElementById("selPeriod");
dropdown.addEventListener("change", function () {
	earthquakeURL = dropdown.value;
	// console.log(earthquakeURL)

	// Call function to access GeoJSON features
	showEarthquake(earthquakeURL)

	// Scroll to the bottom to display map
	var el = document.getElementById('mapbox'),
		top = el.offsetTop;
	window.scrollTo(0, top)
});

function showEarthquake(earthquakeURL) {

	// Perform a GET request to the earthquake URL
	d3.json(earthquakeURL, function (data) {
		// Once we get a response, send the data.features object to the createFeatures function
		createFeatures(data.features);
	});

	function createFeatures(earthquakeData) {

		// Define a function we want to run once for each feature in the features array
		// Give each feature a popup describing the place and time of the earthquake
		function onEachFeature(feature, layer) {
			layer.bindPopup("<h4>" + feature.properties.place +
				"</h4><hr><p>" + new Date(feature.properties.time) + "</p>" +
				"<p> Magnitude: " + (feature.properties.mag) + "</p>");
		}

		// Create a GeoJSON layer containing the features array on the earthquakeData object
		// Run the onEachFeature function once for each piece of data in the array
		var earthquakes = L.geoJSON(earthquakeData, {
			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng);
			},
			style: geojsonMarkerOptions,
			onEachFeature: onEachFeature
		});

		function geojsonMarkerOptions(feature) {
			return {
				radius: markerRadius(feature.properties.mag),
				fillColor: markerColor(feature.properties.mag),
				color: "#000000",
				weight: 0.5,
				opacity: 1,
				fillOpacity: 0.8
			};
		}

		// Change color of marker according to magnitude
		function markerColor(mag) {
			return mag > 5 ? "#581845" :
				mag > 4 ? "#900C3F" :
				mag > 3 ? "#C70039" :
				mag > 2 ? "#FF5733" :
				mag > 1 ? "#FFC300" :
				"#DAF7A6";
		};

		// Change size of marker according to magnitude
		function markerRadius(mag) {
			if (typeof mag === 'null' || mag === 0) {
				return 1;
			} else
				return mag * 4;
		}

		// Sending our earthquakes layer to the createMap function
		createMap(earthquakes);
	}

}

function createMap(earthquakes) {

	// Define different map style layers
	var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "mapbox.light",
		accessToken: API_KEY
	});

	var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "mapbox.dark",
		accessToken: API_KEY
	});

	var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "mapbox.streets",
		accessToken: API_KEY
	});

	var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "mapbox.outdoors",
		accessToken: API_KEY
	});

	var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "mapbox.satellite",
		accessToken: API_KEY
	});

	// Define a baseMaps object to hold our base layers
	var baseMaps = {
		"Light": lightmap,
		"Dark": darkmap,
		"Street": streetmap,
		"Outdoors": outdoormap,
		"Satellite": satellitemap
	};

	// Tectonic plates layer
	var tectonicPlates = new L.LayerGroup();

	var tectonicplatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

	d3.json(tectonicplatesURL, function (geoJson) {
		L.geoJSON(geoJson.features, {
				style: function (geoJsonFeature) {
					return {
						weight: 2,
						color: "orange"
					}
				},
			})
			// add layer to the map.
			.addTo(tectonicPlates);
	});

	// Create overlay object to hold our overlay layer
	var overlayMaps = {
		Earthquakes: earthquakes,
		"Fault Lines": tectonicPlates
	};

	// Create our map, giving it the lightmap and earthquakes layers to display on load
	myMap = L.map("map", {
		center: [
			37.09, -95.71
		],
		zoom: 5,
		layers: [lightmap, earthquakes, tectonicPlates]
	});

	// Create a layer control
	// Pass in our baseMaps and overlayMaps
	// Add the layer control to the map
	L.control.layers(baseMaps, overlayMaps, {
		collapsed: false
	}).addTo(myMap);

	var legend = L.control({
		position: 'bottomright'
	});

	legend.onAdd = function () {

		var div = L.DomUtil.create("div", "info legend"),
			grades = [0, 1, 2, 3, 4, 5];
		colors = ["#DAF7A6", "#FFC300", "#FF5733", "#C70039", "#900C3F", "#581845"];

		// loop through our density intervals and generate a label with a colored square for each interval
		for (var i = 0; i < grades.length; i++) {
			div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
				grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
		}

		return div;
	};

	legend.addTo(myMap);
}
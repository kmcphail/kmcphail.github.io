// Import
//import L from "leaflet";
//import interpolate from "@turf/interpolate";

// Define token
mapboxgl.accessToken = "pk.eyJ1Ijoia21jcGhhaWwiLCJhIjoiY2l4emVudjZlMDA4djMzbG04OXpzbXRtZiJ9.1HzBBQ81SqGOyP5ockK1cA";

// DEFINE MAP
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v9",
  center: [-90, 45],
  zoom: 5
});
var mapNav = new mapboxgl.NavigationControl();
map.addControl(mapNav, "top-left");

// QUANTILES
var max = 18;
var fifth = 18 / 5;
var quantiles = [];
for (i = 0; i < 5; i++) {
  var quantile = (fifth + i) * fifth;
  quantiles.push(quantile);
}
var minRadius = 2;
var maxRadius = 10;
var minNitr = 0;
var maxNitr = 18;
var rateOfChange = (maxRadius - minRadius) / (maxNitr - minNitr);
var radiusAtZero = maxRadius - (rateOfChange * maxNitr);






//Slider
//wellInterp = turf.interpolate(wellPoints, sliderWell, {units: UnitSele})




// ADD LAYERS
map.on("load", function() {
  // Options for labels
  var layers = map.getStyle().layers;
  var firstSymbolID;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol") {
      firstSymbolID = layers[i].id;
      break;
    }
  }
  
  // Cancer tracts
  map.addLayer({
    id: "cancer-tracts",
    type: "fill",
    source: {
      type: "vector",
      url: "mapbox://kmcphail.c1s90awc"
    },
    "source-layer": "cancer_tracts_geojson-br0n8v",
    paint: {
      "fill-color": "rgba(61,153,80,0)",
      "fill-outline-color": "rgba(61,153,80,0.7)"
    },
    "layout": {
      "visibility": "visible"
    }
  }, firstSymbolID);
  
  // Well points
  map.addLayer({
    id: "well-nitrate",
    type: "circle",
    source: {
      type: "vector",
      url: "mapbox://kmcphail.3dbenvnn"
    },
    "source-layer": "well_nitrate_geojson-0qxlvm",
    paint: {
      "circle-radius": {
        property: "nitr_ran",
        type: "exponential",
        stops: [[0, 2],[18, 12]]
      },
      
      /*[
        "interpolate", ["linear"], ["zoom"],
        5, ["-", 7, ["number", ["get", "nitr_ran"], 7]],
        7, ["-", 9, ["number", ["get", "nitr_ran"], 9]],
        9, ["-", 11, ["number", ["get", "nitr_ran"], 11]],
        11, ["-", 13, ["number", ["get", "nitr_ran"], 13]]
      ],*/
      "circle-color": "rgb(171, 72, 33)",
      "circle-opacity": 0.7
    },
    "layout": {
      "visibility": "visible"
    }
  }, firstSymbolID);
  
  
  // Interpolation
  /*map.addLayer({
    id: "Interpolation",
    type: "geojson",
    source: {
      type: "vector",
      url: "mapbox://kmcphail.3dbenvnn"
    },
    "source-layer": "well_nitrate_geojson-0qxlvm",
    "layout": {},
    paint: {
      "circle-radius": {
        property: "nitr_ran",
        type: "exponential",
        stops: [
          [0, 2],
          [18, 12]
        ]
      },
      
      [
        "interpolate", ["linear"], ["zoom"],
        5, ["-", 7, ["number", ["get", "nitr_ran"], 7]],
        7, ["-", 9, ["number", ["get", "nitr_ran"], 9]],
        9, ["-", 11, ["number", ["get", "nitr_ran"], 11]],
        11, ["-", 13, ["number", ["get", "nitr_ran"], 13]]
      ],
      "circle-color": "rgb(171, 72, 33)",
      "circle-opacity": 0.7
    },
    "layout": {
      "visibility": "visible"
    }
  }, firstSymbolID);*/
  
  // Regression
  
  
});

// POPUP BOX
var popup = new mapboxgl.Popup();
map.on("mousemove", function(e) {
  var features = map.queryRenderedFeatures(e.point, {layers: ["well-nitrate"] });
  if (!features.length) {
    popup.remove();
    return;
  }
  var feature = features[0];

  popup.setLngLat(feature.geometry.coordinates)
  .setHTML(feature.properties.nitr_ran + " ppm")
  .addTo(map);
  
  map.getCanvas().style.cursor = features.length ? "pointer" : "";
});

// MENU TOGGLE
var toggleableLayerIds = ["cancer-tracts", "well-nitrate", "Interpolation", "Regression"];
for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement("a");
  link.href = "#";
  link.className = "active";
  link.textContent = id;

  link.onclick = function (e) {
    var clickedLayer = this.textContent;
    e.preventDefault();
    e.stopPropagation();

    var visibility = map.getLayoutProperty(clickedLayer, "visibility");

    if (visibility === "visible") {
      map.setLayoutProperty(clickedLayer, "visibility", "none");
      this.className = "";
    } else {
      this.className = "active";
      map.setLayoutProperty(clickedLayer, "visibility", "visible");
    }
  };

  var layers = document.getElementById("menu");
  layers.appendChild(link);
}

// LEGEND
var legend = document.getElementById("legend");
function circleSize(quantile) {
  var radius = (rateOfChange * quantile) + radiusAtZero;
  var diameter = radius * 2;
  return diameter;
}
quantiles.forEach(function(quantile) {
  legend.insertAdjacentHTML("beforeend", "<div><span style='width:" + circleSize(quantile) + "px;height:" + circleSize(quantile) + "px;margin: 0 " + [(20 - circleSize(quantile)) / 2] + "px'></span><p>" + quantile + "</p></div>");
});

// INTERACTIVITY
/*map.on("click", function(e) {
  var wellFeatures = map.queryRenderedFeatures(e.point, { layers: ["well-nitrate"] });
  if (!wellFeatures.length) {
    return;
  }
  var wellFeature = wellFeatures[0];
  var nearestFeature = turf.nearest(wellFeature, well-nitrate);
  if (nearestFeature !== null) {
    map.getSource("nearest-feature").setData({
      type: "FeatureCollection",
      features: [
        nearestFeature
      ]
    }
  );
    map.addLayer({
      id: "nearest-feature",
      type: "circle",
      source: "nearest-feature",
      paint: {
        "circle-radius": 12,
        "circle-color": "#486DE0"
      }
    }, "well-nitrate");
  }
});*/

/*var randPoints = turf.randomPoint(30, {bbox: [-80, -100, 55, 35]});
turf.featureEach(randPoints, function(point) {
    point.properties.solRad = Math.random() * 50;
});
var options = {gridType: "randPoints", property: "solRad", units: "miles"};
var grid = turf.interpolate(randPoints, 100, options);
var addToMap = [grid];*/



////////


// Load Data

/*$.getJSON("data/well_nitrate_geojson.geojson", function(data) {
  var wellNitr = L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        color: "rgba(61,153,80,1)",
        fillColor: "rgba(61,153,80,1)",
        opacity:  1,
        fillOpacity: 1,
        radius: 2,
        weight: .5
      });
    }
  }).addTo(map);
});*/





// Create feature collection using turf
/*function interpolateNitr(){
  
  wellNitr.eachLayer(function(lyr) {
    var prop = lyr.feature.properties;
    var coor = lyr.feature.geometry.coordinates;
  });
  var wellNitrFeat = turf.point(coor, prop);
  wellNitrArr.push(wellNitrFeat);
};

wellNitrFeatColl = turf.featureCollection(wellNitrArr);*/



// User input
/*function userInput() {
  distDecayCoeff = $("#distDecayCoeff").val();
  distDecayCoeff = parseFloat(distDecayCoeff);
  
  
  
  interpolateNitr(distDecayCoeff, );
};*/
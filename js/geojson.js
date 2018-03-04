////
// Define and create map
function createMap() {
  var map = L.map("mapid", {
      center: [39, -106],
      zoom: 6
  });

  // Add OSM base tilelayer to map
  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);

  // Call getData() on map
  //getData(map);
  //getDataPS(map);
  getDataSC(map);
  
  // Legend
  legend.addTo(map);
};

//// Marker Cluster
// Include text pop-ups for each point feature
function onEachFeature(feature, layer) {
  // Create HTML string w/ properties
  var popupContent = "";
  if (feature.properties) {
    // Create loop to add feature property names and values to popupContent
    for (var property in feature.properties){
        popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
    }
    popupContent += "<p>" + getForecast() + "</p>";
    layer.bindPopup(popupContent);
  };
};
// Retrieve data and place it on the map
function getData(map) {
  // Load data
  $.ajax("data/peaks.geojson", {
    dataType: "json",
    success: function(response){
      // Examine data
      console.log(response)

      // Marker options
      var peakIcon = L.Icon.extend ({
        radius: 8,
        fillColor: "#FF7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });

/*      // Create layer & add it to the map
      L.geoJson(response, {
        // Retrieve marker options
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        // Retrieve pop-up text
        onEachFeature: onEachFeature,
        // Filter properties
        filter: function(feature, layer) {
          return feature.properties
        }
      }).addTo(map);*/
      
      var markerClusterOptions = {
        radius: 8,
        fillColor: "#FF7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      
      // Define a cluster group layer
      var markers = L.markerClusterGroup();

      //loop through features to create markers and add to MarkerClusterGroup
      for (var i = 0; i < response.features.length; i++) {
        var a = response.features[i];
        // Create HTML string for each marker
        var properties = "";
        for (var property in a.properties) {
          properties += "<p>" + property + ": " + a.properties[property] + "</p>";
        };
        var marker = L.marker(
          new L.LatLng(a.geometry.coordinates[1], a.geometry.coordinates[0]), { properties: properties });
        // Add popup for each
        marker.bindPopup(properties);
        // Add marker to group
        markers.addLayer(marker);
      }

      //add MarkerClusterGroup to map
      map.addLayer(markers);
      
      
/*      // Create geojson leaflet 
      var geoJsonLayer = L.geoJson(response);
      // Create cluster layer
      var markers = L.markerClusterGroup();
      // Add geojson to cluster
      markers.addLayer(geoJsonLayer);
      // Add cluster to map
      map.addLayer(markers);*/
      
      // Tile layers
      
    }  
  });
};

//// Proportional Symbol
function createPropSymbols(data, map) {
  // Marker options
  var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#FF7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
  
  var attr = "rank";
  
  //
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      var propValue = Number(feature.properties[attr]);
      //console.log(feature.properties, propValue);
      geojsonMarkerOptions.radius = calcPropRadius(propValue);
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  }).addTo(map);
};
//
function calcPropRadius(propValue) {
  var scaleFactor = 50;
  var area = propValue * scaleFactor;
  var radius = Math.sqrt(area/Math.PI);
  return radius;
}
//
function getDataPS(map){
  //load the data
  $.ajax("data/peaks.geojson", {
    dataType: "json",
    success: function(response){
      //call function to create proportional symbols
      createPropSymbols(response, map);
    }
  });
};

//// Popup & Panel
function pointToLayer(feature, latlng, attrs){
  //var attr = "rank";
  var attr = attrs[0];
  console.log(attr);

  //create marker options
/*  var options = {
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };*/
  

  var propValue = Number(feature.properties[attr]);
//console.log(propValue);
  var options = {
    fillColor: getColor(propValue),
    weight: 2,
    opacity: 1,
    color: "#FFF",
    dashArray: "3",
    fillOpacity: 0.7
  };
//console.log(options["fillColor"]);
  options.radius = calcPropRadius(propValue);
  var layer = L.circleMarker(latlng, options);
  var popupContent = 
    "<p><b>Peak:</b> " + feature.properties["name"];
  /*var year = attribute.split("_")[1];
    popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " million</p>";*/
  var panelContent = 
    "<p><b>Peak:</b> " + feature.properties["name"] + 
    "</p><p><b>" + attr + ":</b> " + 
    feature.properties[attr] + "</p>";
  
  // Event listeners 
  layer.on({
    mouseover: function() {
      this.openPopup();
    },
    mouseout: function() {
      this.closePopup();
    },
    click: function() {
      $("#panel").html(panelContent);
    }
  });
  
  layer.bindPopup(popupContent, {
    offset: new L.Point(0, -options.radius),
    closeButton: false
  });
  return layer;
};
//
function createPropSymbols(data, map, attrs) {
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return pointToLayer(feature, latlng, attrs);
    }
  }).addTo(map);
};

//// Sequence Control
function createSequenceControls(map) {
  // Create slider
  $("#panel").append(
    "<input class='range-slider' type='range'>"
  );
  // Slider attributes
  $(".range-slider").attr({
    max: 6,
    min: 0,
    value: 0,
    step: 1
  });
  // Buttons
  $("#panel").append("<button class='skip' id='reverse'>Reverse</button>");
  $("#panel").append("<button class='skip' id='forward'>Skip</button>");
  //$('#reverse').html('<img src="img/reverse.png">');
  //$('#forward').html('<img src="img/forward.png">');
  
  $(".skip").click(function() {
    var index = $(".range-slider").val();
      if ($(this).attr("id") == "forward") {
        index++;
        index = index > 6 ? 0 : index;
      } else if ($(this).attr("id") == "reverse") {
        index--;
        index = index < 0 ? 6 : index;
      };
    
    $(".range-slider").val(index);
    //updatePropSymbols(map, attrs[index]);
  });
  $(".range-slider").on("input", function() {
    var index = $(this).val();
  });
  //updatePropSymbols(map, attrs[index]);
};
//
function updatePropSymbols(map, attr) {
  map.eachLayer(function(layer) {
    if (layer.feature && layer.feature.properties[attr]) {
      // Define and set variables
      var props = layer.feature.properties;
      var radius = calcPropRadius(props[attr]);
      layer.setRadius(radius);
      var popupContent = "<p><b>Peak:</b> " + props.name + "</p>";
      //var year = attribute.split("_")[1];
      //var day = attribute[];
      
      popupContent += "<p><b>Temp for " + /*day*/ + ":</b> " + props[attr] + "°F</p>";
      layer.bindPopup(popupContent, {
        offset: new L.Point(0, -radius)
      });
    };
  });
};
//
function processData(data) {
  var attrs = [];
  var properties = data.features[0].properties;

  for (var attr in properties){
    if (attr.indexOf("rank") > -1){
      attrs.push(attr);
    };
  };

  console.log(attrs);
  return attrs;
};
//
function getDataSC(map){
  $.ajax("data/peaks.geojson", {
    dataType: "json",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createPropSymbols(response, map, attrs);
      createSequenceControls(map, attrs);
    }
  });
};

//// Fifth Operator - 
//// Choropleth
//
function getColor(val) {
  return  val > 55 ? "#B2182B":
          val > 50 ? "#EF8A62":
          val > 40 ? "#FDDBC7":
          val > 30 ? "#D1E5F0":
          val > 20 ? "#67A9CF":
          val > 10 ? "#2166AC":
                     "#F7F7F7";
/*          temp > 90 ? "#B2182B":
          temp > 75 ? "#EF8A62":
          temp > 60 ? "#FDDBC7":
          temp > 40 ? "#D1E5F0":
          temp > 25 ? "#67A9CF":
          temp > 10 ? "#2166AC":
                      "#F7F7F7";*/
};
//
/*function highlightFeature(feat) {
  var layer = feat.target;
  layer.setStyle({
    color: "#777",
    weight: 4,
    dashArray: "",
    fillOpacity: 0.7
  });
  
  if (!L.Browser.ie && 
      !L.Browser.opera && 
      !L.Browser.edge) {
    layer.bringToFront();
  }
}
function resetHighlight(feat) {
  geojson.resetStyle(feat.target)
}*/
// Legend
function createLegend(feature, map) {
  var temps = [10, 20, 30, 40, 50, 55];
  for (var i = 0; i < temps.length; i++) {
    $("#panel").append(
      "<p><b>Peak:</b> " + feature.properties["name"] + "</p>";
      //"<p>" + getColor(temps[i] + 1) + feature.properties["rank"] + "</p>";
    );
  }
};

//// Resymbolize


$(document).ready(createMap);
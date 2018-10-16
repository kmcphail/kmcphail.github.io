//// Map & Tilelayers
function createMap() {
  // Define map
  var map = L.map("map", {
      //style: "mapbox://styles/mapbox/light-v9",
      center: [45, -90],
      zoom: 6
  });

  // Add OSM base tilelayer 
  var osmTileLayer = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);
  
  // Call data on map
//  var wellNITR = getDataPoints(map);
  //var gridIDW = turf.idw(wellNITR, "nitr_ran", 0.3, 0.5, "kilometers");
  //getDataTracts(map);
  //getDataFilter(map);
  
  // Add legend to map
  //legend.addTo(map);
  
  var bbox = turf.bbox(features);
  var randPoints = turf.randomPoint(30, {bbox: [40, 50, -80, -100]});
  turf.featureEach(randPoints, function(point) {
    point.properties.solRad = Math.random() * 50;
  });
  var options = {gridType: "points", property: "solRad", units: "miles"};
  var grid = turf.interpolate(randPoints, 100, options);
  
};

// Create proportional symbol
function createPropSymbols(data, map) {
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      var propValue = Number(feature.properties[attr]);
      geojsonMarkerOptions.radius = calcPropRadius(propValue);
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  }).addTo(map);
};
// Calculate proportional symbol radius
function calcPropRadius(propValue) {
  var scaleFactor = 30;
  var area = propValue * scaleFactor;
  var radius = Math.sqrt(area/Math.PI);
  return radius;
}

// Popup & Panel
function pointToLayer(feature, latlng, attrs){
  // Define feature attributes
  var attr = attrs[0];
  var nitrRan = feature.properties["nitr_ran"];
  var nitrID = feature.properties["TARGET_FID"];
  
  // Define radius attribute 
  var propValue = Number(nitrRan);
  // Define symbology
  var options = {
    weight: 1.5,
    opacity: 1,
    color: "#FFF",
    dashArray: "2",
    fillOpacity: 0.5
  };
  options.radius = calcPropRadius(propValue);
  options.fillColor = getColor(propValue);
  
  var layer = L.circleMarker(latlng, options);
  
  var popupContent = 
    // Label
    "<p><b>Nitrate Level:</b> " + nitrRan + " ppm" + "</p>";

  var panelContent = 
    // Nitrate Label
    "<p><b>" + nitrRan + ". </b>" +
    // ID Label
    "<b>" + nitrID + "</b></p>";
  
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
// Create proportional symbols
function createPropSymbols(data, map, attrs) {
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return pointToLayer(feature, latlng, attrs);
    }
  }).addTo(map);
};
function polyToLayer(feature, latlng, attrs){
  // Define feature attributes
  var attr = attrs[0];
  var nitrRan = feature.properties["nitrate"];
  var canRate = feature.properties["canrate"];
  var nitrID = feature.properties["GEOID10"];
  
  // Define symbology
  var options = {
    weight: 1.5,
    opacity: 1,
    color: "#FFF",
    dashArray: "2",
    fillOpacity: 0.5
  };
  options.fillColor = getColor(nitrRan);
  
  //var layer = L.circleMarker(latlng, options);
  
  var popupContent = 
    //  Label
    "<p><b>Peak:</b> " + nitrRan + "</p>";

  var panelContent = 
    // Rank Label
    "<p><b>" + nitrRan + ". </b>" +
    // Peak Label
    "<b>" + nitrID + "</b></p>";
  
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
// Create color symbols
function createColorSymbols(data, map, attrs) {
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return polyToLayer(feature, latlng, attrs);
    }
  }).addTo(map);
};

//// Sequence Control
// Create sequence controls
function createSequenceControls(map, attrs) {
  // Create slider
  $("#panel").append(
    "<input class='range-slider' type='range'>"
  );
  // Slider attributes
  $(".range-slider").attr({
    max: 7, 
    min: 0, 
    value: 0,
    step: 1 
  });
  // Buttons
  $("#panel").append("<button class='skip' id='reverse'></button>");
  $("#panel").append("<button class='skip' id='forward'></button>");
  //$("#reverse").html("<img src='img/glyphicon glyphicon-step-backward'>");
  //$("#forward").html("<img src='img/glyphicon glyphicon-step-forward'>");
  $("#reverse").html("<button type='button' class='btn btn-default'><span class='glyphicon glyphicon-step-backward'></span></button>");
  $("#forward").html("<button type='button' class='btn btn-default'><span class='glyphicon glyphicon-step-forward'></span></button>");
  
  $(".skip").click(function() {
    var index = $(".range-slider").val();
      if ($(this).attr("id") == "forward") {
        index++;
        index = index > 7 ? 0 : index;
      } else if ($(this).attr("id") == "reverse") {
        index--;
        index = index < 0 ? 7 : index; 
      };
    
    $(".range-slider").val(index);
    updatePropSymbols(map, attrs[index]);
  });
  $(".range-slider").on("input", function() {
    var index = $(this).val();
    updatePropSymbols(map, attrs[index]);
  });
};
// Update proportional symbols
function updatePropSymbols(map, attr) {
  map.eachLayer(function(layer) {
    if (layer.feature && layer.feature.properties[attr]) {
      // Define and set variables
      var props = layer.feature.properties;
      var radius = calcPropRadius(props[attr]);
      layer.setRadius(radius);
      var popupContent = "<p><b>Peak:</b> " + props.name + "</p>";
      
      popupContent += "<p><b>Temp for " + /*day*/ + ":</b> " + props[attr] + "°F</p>";
      layer.bindPopup(popupContent, {
        offset: new L.Point(0, -radius)
      });
    };
  });
};
// Process data
function processData(data) {
  var attrs = [];
  var properties = data.features[0].properties;
  //console.log(properties);
  for (var attr in properties){
    if (attr.indexOf("rank") > -1){
      attrs.push(attr);
    };
  };

  console.log(attrs);
  return attrs;
};
// Get sequence control data
function getDataPoints(map){
  $.ajax("data/well_nitrate_geojson.geojson", {
    dataType: "json",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createPropSymbols(response, map, attrs);
      createSequenceControls(map, attrs);
      //filterRange(map, attrs);
    }
  });
};
function getDataTracts(map){
  $.ajax("data/cancer_tracts_geojson.geojson", {
    dataType: "json",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createColorSymbols(response, map, attrs);
      createSequenceControls(map, attrs);
    }
  });
};

//// Fifth Operator - 
//// Choropleth
// 
function getColor(val) {
  return  val > 18 ? "#B2182B":
          val > 14 ? "#EF8A62":
          val > 10 ? "#FDDBC7":
          val > 6 ? "#D1E5F0":
          val > 2 ? "#67A9CF":
          val > -2 ? "#2166AC":
                     "#F7F7F7";
};

// Mountain Range Filter
/*function filterRange(map, attr) {
  $(".filter-UI a").on("click", function() {
    // Get filter attribute values
    var filter = $(this).data("filter");
    $(this).addClass("active").siblings().removeClass("active");
    markers.setFilter(function(f) {
      return (filter === "all") ? true: f.properties[filter] === true;
    });
    return false;
  });
}*/

//// Filter
// Filter by range
// Create Group Layers & Filter Function
/*var groupLayers = [];
L.geoJSON(data, {onEachFeatLayer: onEachFeatLayer}).addTo(map);
function onEachFeatLayer(feat, featLayer) {
  var rangeGL = groupLayers[feat.properties["range"]];
  if (rangeGL === undefined) {
    rangeGL = new L.layerGroup();
    rangeGL.addTo(map);
    groupLayers[feat.properties["range"]] = rangeGL;
  }
  rangeGL.addLayer(featLayer);
}
showLayer("Front Range");
function showLayer(id) {
  var rangeGL = groupLayers[id];
  map.addLayer(rangeGL);   
}
function hideLayer(id) {
  var rangeGL = groupLayers[id];
  map.removeLayer(rangeGL);   
}
*/
// Create Filter
/*
function createFilter(data, map) {
  // Define range attribute
  var attr = "forecast";
  // 
  L.geoJSON(data, {
    filter: function(feature, layer) {
      return feature.properties[attr];
    }
  }).addTo(map);
};
// Call Filter
function getDataFilter(map){
  $.ajax("data/peaks_weather.geojson", {
    dataType: "json",
    success: function(response){
      createFilter(response, map);
    }
  });
};
*/

//// Legend
/*
function createLegend(feature, map) {
  var nitrVal = [-2, 2, 6, 10, 14, 18];
  for (var i = 0; i < temps.length; i++) {
    $("#panel").append(
      "<p><b>Nitrate Levels:</b> " + feature.properties["name"] + "</p>";
      //"<p>" + getColor(temps[i] + 1) + feature.properties["rank"] + "</p>";
    );
  }
};
*/

$(document).ready(createMap);
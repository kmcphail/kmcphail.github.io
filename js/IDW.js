//// Map & Tilelayers
function createMap() {
  // Define token
  mapboxgl.accessToken = "pk.eyJ1Ijoia21jcGhhaWwiLCJhIjoiY2l4emVudjZlMDA4djMzbG04OXpzbXRtZiJ9.1HzBBQ81SqGOyP5ockK1cA"
  
  // Define map
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v9",
    center: [-90, 45],
    zoom: 6
  });
  
  // Call data on map
//  var wellNITR = getDataPoints(map);
  //var gridIDW = turf.idw(wellNITR, "nitr_ran", 0.3, 0.5, "kilometers");
  //getDataTracts(map);
  //getDataFilter(map);
  
  // Add legend to map
  //legend.addTo(map);
  
  var bbox = turf.bbox(features);
  var randPoints = turf.randomPoint(30, {bbox: [-80, -100, 40, 50]});
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

$(document).ready(createMap);
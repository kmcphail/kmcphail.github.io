//// Map & Tilelayers
function createMap() {
  // Define map
  var map = L.map("mapid", {
      center: [39, -106],
      zoom: 6
  });

  // Add OSM base tilelayer 
  var osmTileLayer = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);

  // Call getData() on map
  //getData(map);
  //getDataPS(map);
  getDataSC(map);
  getForecast(map);
  //getDataFilter(map);
  
  // Legend
  //legend.addTo(map);
};

//// Marker Cluster
// Include text pop-ups for each point feature
// onEachFeature
/*function onEachFeature(feature, layer) {
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
};*/
// Retrieve data and place it on the map
/*function getData(map) {
  // Load data
  $.ajax("data/peaks.geojson", {
    dataType: "json",
    success: function(response){
      // Examine data
      //console.log(response)

      // Marker options
      var peakIcon = L.Icon.extend ({
        radius: 8,
        fillColor: "#FF7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });

      // Create layer & add it to the map
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
      }).addTo(map);
      
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
      
      
      // Create geojson leaflet 
      var geoJsonLayer = L.geoJson(response);
      // Create cluster layer
      var markers = L.markerClusterGroup();
      // Add geojson to cluster
      markers.addLayer(geoJsonLayer);
      // Add cluster to map
      map.addLayer(markers);
      
      // Tile layers
      
    }  
  });
};*/

//// Create proportional symbol
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
// Calculate sroportional symbol radius
function calcPropRadius(propValue) {
  var scaleFactor = 35;
  var area = propValue * scaleFactor;
  var radius = Math.sqrt(area/Math.PI);
  return radius;
}
// Get proportional symbol
/*function getDataPS(map){
  //load the data
  $.ajax("data/peaks.geojson", {
    dataType: "json",
    success: function(response){
      //call function to create proportional symbols
      createPropSymbols(response, map);
    }
  });
};*/

//// Popup & Panel
function pointToLayer(feature, latlng, attrs){
  var attr = attrs[0]; // "rank"
  //console.log(attr);
  var peakName = attrs["name"]; // "name"
  var peakRange = attrs["range"]; // "range"
  
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
//console.log(feature.properties["range"]);
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
    // Peak Label
    "<p><b>Peak:</b> " + feature.properties["name"] + "</p>";
  /*var year = attribute.split("_")[1];
    popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " million</p>";*/
  var panelContent = 
    // Rank Label
    "<p><b>" + feature.properties["rank"] + ". </b>" +
    // Peak Label
    "<b>" + feature.properties["name"] + "</b></p>" +
    // Range Label
    "<p><b>Locale: </b>" + feature.properties["range"] + 
    "</p><br>";
  
  
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

//// Sequence Control
// Create sequence controls
function createSequenceControls(map) {
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
      //var year = attribute.split("_")[1];
      //var day = attribute.split["},{"];
      
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

  //console.log(attrs);
  return attrs;
};
// Get sequence control data
function getDataSC(map){
  $.ajax("data/peaks_weather.geojson", {
    dataType: "json",
    success: function(response){
      // Create array 
      var attrs = processData(response);
      
      createPropSymbols(response, map, attrs);
      createSequenceControls(map, attrs);
    }
  });
};

//// Forecast
// Show forecast
function showForecast(latitude, longitude) {
  // Define variables
  var apiKey = "2ef0d25a58c09e083c5783ee44cbfea9",
      url = "https://api.darksky.net/forecast/",
      lat = latitude,
      lng = longitude,
      options = "?exclude=[summary,currently,minutely,hourly,alerts,flags]",
      apiString = url + apiKey + "/" + lat + "," + lng + options;
  var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  var Sun = [],
      Mon = [],
      Tue = [],
      Wed = [],
      Thu = [],
      Fri = [],
      Sat = [],
      Sun = [];
  
  $.getJSON(apiString, function(forecast) {
    // Cycle through next seven days
    for (var i = 0, j = forecast.daily.data.length; i < j - 1; i++) {
    
      var date = new Date(forecast.daily.data[i].time * 1000),
        day      = days[date.getDay()],
        time     = forecast.daily.data[i].time,
        summary  = forecast.daily.data[i].summary,
        tempMax = Math.round(forecast.daily.data[i].temperatureMax),
        tempMin = Math.round(forecast.daily.data[i].temperatureMin);

      // Append Markup for each Forecast of the 7 day week
      $("#forecast").append(
        "<li><div class='card-container'><div><div class='front card'><div>" +
          "<div><b>Day</b>: " + date.toLocaleDateString() + "</div>" +
          "<div><b>Temperature</b>: " + temp + "</div>" +
          "<div><b>Max Temp.</b>: " + tempMax + "</div>" +
          "<div><b>Min Temp.</b>: " + tempMin + "</div>" +
          "<p class='summary'>" + summary + "</p>" +
          "</div></div><div class='back card'>" +
          "<div class='hourly" + " " + day + "'><b>24hr Forecast</b><ul class='list-reset'></ul></div></div></div></div></li>"
      );

      // Daily forecast report for each day of the week
      switch(day) {
        case "Sunday":
          hourlyReport(Sun, days[0]);
          break;
        case "Monday":
          hourlyReport(Mon, days[1]);
          break;
        case "Tuesday":
          hourlyReport(Tue, days[2]);
          break;
        case "Wednesday":
          hourlyReport(Wed, days[3]);
          break;
        case "Thursday":
          hourlyReport(Thu, days[4]);
          break;
        case "Friday":
          hourlyReport(Fri, days[5]);
          break;
        case "Saturday":
          hourlyReport(Sat, days[6]);
          break;
      }
    }
  });
}

// Process forecast data
function processForecast(data) {
  var attrs = [];
  var properties = data["daily"]["data"];
  //console.log(properties);
  for (var attr in properties) {
    if (attr.indexOf(properties) > -1) {
      attrs.push(attr);
    };
    //attrs.push(attr);
    
   /* ["time", "summary", "icon", "sunriseTime", "sunsetTime", "moonPhase", "precipIntensity", "precipIntensityMax", "precipIntensityMaxTime", "precipProbability", "precipAccumulation", "precipType", "temperatureHigh", "temperatureHighTime", "temperatureLow", "temperatureLowTime", "apparentTemperatureHigh", "apparentTemperatureHighTime", "apparentTemperatureLow", "apparentTemperatureLowTime", "dewPoint", "humidity", "pressure", "windSpeed", "windGust", "windGustTime", "windBearing", "cloudCover", "uvIndex", "uvIndexTime", "visibility", "ozone", "temperatureMin", "temperatureMinTime", "temperatureMax", "temperatureMaxTime", "apparentTemperatureMin", "apparentTemperatureMinTime", "apparentTemperatureMax", "apparentTemperatureMaxTime"]*/
    
  };

  //console.log(attrs);
  return attrs;
};
// Get forecast
function getForecast(map) {
  $.ajax("data/forecast_test.json", {
    dataType: "json",
    success: function(response) {
      var attrs = processForecast(response);
      //console.log(attrs);
      //var lat = response["latitude"];
      //var lng = response["longitude"];
      //console.log(lat, lng);
      //var daily = response["daily"];
      //$("#forecast").html("<p>" + lat + ", " + lng + "</p>");
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
          temp > 80 ? "#D6604D":
          temp > 70 ? "#F4A582":
          temp > 60 ? "#FDDBC7":
          temp > 50 ? "#D1E5F0":
          temp > 40 ? "#92C5DC":
          temp > 30 ? "#4393C3":
          temp > 20 ? "#2166AC":
                      "#F7F7F7";*/
};
// Highlight Feature
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
/*
function createLegend(feature, map) {
  var temps = [10, 20, 30, 40, 50, 55];
  for (var i = 0; i < temps.length; i++) {
    $("#panel").append(
      "<p><b>Peak:</b> " + feature.properties["name"] + "</p>";
      //"<p>" + getColor(temps[i] + 1) + feature.properties["rank"] + "</p>";
    );
  }
};
*/

//// Filter
// Filter by range
// Create Group Layers
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
}*/
/*
// Create Filter
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
// ajax MapBox Filter
$(".filter-UI a").on("click", function() {
  // Get filter attribute values
  var filter = $(this).data("filter");
  $(this).addClass("active").siblings().removeClass("active");
  markers.setFilter(function(f) {
    return (filter === "all") ? true: f.properties[filter] === true;
  });
  return false;
});
*/


$(document).ready(createMap);
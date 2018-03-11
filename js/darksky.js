
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
  var = "Sun" = [],
        "Mon" = [],
        "Tue" = [],
        "Wed" = [],
        "Thu" = [],
        "Fri" = [],
        "Sat" = [],
        "Sun" = [];
  
  $.getJSON(apiString, function(forecast) {
    // Cycle through next seven days
    for (var i = 0, j = forecast.daily.data.length; i < j - 1; i++) {
    
      var date = new Date(forecast.daily.data[i].time * 1000),
        day      = days[date.getDay()],
        time     = forecast.daily.data[i].time,
        humidity = forecast.daily.data[i].humidity,
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
          "<div><b>Humidity</b>: " + humidity + "</div>" +
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

//https://api.darksky.net/forecast/2ef0d25a58c09e083c5783ee44cbfea9/39.742043,-104.991531

// FILE
/*$.getJSON("data/forecast_test.json", function(forecast) {
  //console.log(forecast);
  var currWeek = forecast["daily"]["data"];
  var today = currWeek[0];
  //console.log(today);
});*/
// URL
/*$.getJSON("https://api.darksky.net/forecast/2ef0d25a58c09e083c5783ee44cbfea9/39.742043,-104.991531?exclude=[summary,currently,minutely,hourly,alerts,flags]", function(forecast) {
  //console.log(forecast);
  var currWeek = forecast["daily"]["data"];
  var today = currWeek[0];
  //console.log(today);
});*/

function processForecast(data) {
  var attrs = [];
  var properties = data["daily"]["data"][0];
  //console.log(properties);
  for (var attr in properties) {
    /*if (attr.indexOf("time")) {
      attrs.push(attr);
    };*/
    attrs.push(attr);
    
   /* ["time", "summary", "icon", "sunriseTime", "sunsetTime", "moonPhase", "precipIntensity", "precipIntensityMax", "precipIntensityMaxTime", "precipProbability", "precipAccumulation", "precipType", "temperatureHigh", "temperatureHighTime", "temperatureLow", "temperatureLowTime", "apparentTemperatureHigh", "apparentTemperatureHighTime", "apparentTemperatureLow", "apparentTemperatureLowTime", "dewPoint", "humidity", "pressure", "windSpeed", "windGust", "windGustTime", "windBearing", "cloudCover", "uvIndex", "uvIndexTime", "visibility", "ozone", "temperatureMin", "temperatureMinTime", "temperatureMax", "temperatureMaxTime", "apparentTemperatureMin", "apparentTemperatureMinTime", "apparentTemperatureMax", "apparentTemperatureMaxTime"]*/
    
  };

  //console.log(attrs);
  return attrs;
};

// FILE
/*function getForecast() {
  $.ajax("data/forecast_test.json", {
    dataType: "json",
    success: function(response) {
      var attrs = processForecast(response);
      console.log(attrs);
      //var lat = response["latitude"];
      //var lng = response["longitude"];
      //console.log(lat, lng);
      //var daily = response["daily"];
      //$("#forecast").html("<p>" + lat + ", " + lng + "</p>");
    }
  });
};*/
// URL
/*function getForecast() {
  var dsAPI = "https://api.darksky.net/forecast/2ef0d25a58c09e083c5783ee44cbfea9/39.742043,-104.991531?exclude=[summary,currently,minutely,hourly,alerts,flags]";
  $.ajax(dsAPI, {
    dataType: "json",
    success: function(response) {
      var attrs = processForecast(response);
      //console.log(attrs);
    }
  });
};*/

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

//
/*$("button").on("click", function(submit) {
  //
  var lat = $("#latitude").val(),
      lng = $("#longitude").val()
  
  //
  if (lat && lng !== "") {
    submit.preventDefault();
    
    // Submit forecast request
    $(".form").(function() {
      showForecast(lat, lng);
    });
  }
});*/

// Refresh last entered locations
/*$("body").on("click"), "#back", function() {
  window.location.reload(true);
}*/


////
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

//$(document).ready(getForecast);
$(document).ready(showForecast);
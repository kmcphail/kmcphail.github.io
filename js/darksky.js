
function showForecast(latitude, longitude) {
  var apiKey = "2ef0d25a58c09e083c5783ee44cbfea9",
      url = "https://api.darksky.net/forecast/",
      lat = latitude,
      lng = longitude,
      apiString = url + apiKey + "/" + lat + "," + lng;
  
  
  $.getJSON(apiString, function(forecast) {
    // Loop through next seven days
    for (var i = 0, j = forecast.daily.data.length; i < j - 1; i++) {
    
    var date = new Date(forecast.daily.data[i].time * 1000),
					day      = days[date.getDay()],
					skicons  = forecast.daily.data[i].icon,
					time     = forecast.daily.data[i].time,
					humidity = forecast.daily.data[i].humidity,
					summary  = forecast.daily.data[i].summary,
					temp    = Math.round(forecast.hourly.data[i].temperature),
					tempMax = Math.round(forecast.daily.data[i].temperatureMax);

			// If Celsius is checked then convert degrees to celsius
			// for 24 hour forecast results
			if(isCelsiusChecked) {
				temp    = fToC(temp);
				tempMax = fToC(tempMax);
				temp = Math.round(temp);
				tempMax = Math.round(tempMax);
			}

			// Append Markup for each Forecast of the 7 day week
			$("#forecast").append(
				'<li class="shade-'+ skicons +'"><div class="card-container"><div><div class="front card"><div>' +
					"<div class='graphic'><canvas class=" + skicons + "></canvas></div>" +
					"<div><b>Day</b>: " + date.toLocaleDateString() + "</div>" +
					"<div><b>Temperature</b>: " + temp + "</div>" +
					"<div><b>Max Temp.</b>: " + tempMax + "</div>" +
					"<div><b>Humidity</b>: " + humidity + "</div>" +
					'<p class="summary">' + summary + '</p>' +
					'</div></div><div class="back card">' +
					'<div class="hourly' + ' ' + day + '"><b>24hr Forecast</b><ul class="list-reset"></ul></div></div></div></div></li>'
			);

			// Daily forecast report for each day of the week
			switch(day) {
				case 'Sunday':
					hourlyReport(sunday, days[0]);
					break;
				case 'Monday':
					hourlyReport(monday, days[1]);
					break;
				case 'Tuesday':
					hourlyReport(tuesday, days[2]);
					break;
				case 'Wednesday':
					hourlyReport(wednesday, days[3]);
					break;
				case 'Thursday':
					hourlyReport(thursday, days[4]);
					break;
				case 'Friday':
					hourlyReport(friday, days[5]);
					break;
				case 'Saturday':
					hourlyReport(saturday, days[6]);
					break;
			}
		}
  });
}

//https://api.darksky.net/forecast/2ef0d25a58c09e083c5783ee44cbfea9/39.742043,-104.991531


//
$("button").on("click", function(submit) {
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
});

// Refresh last entered locations
$("body").on("click"), "#back", function() {
  window.location.reload(true);
}


////

$(document).ready(showForecast);
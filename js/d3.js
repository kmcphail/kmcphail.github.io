//
// Tutorial
//
//var topology = topojson.topology({foo: geojson});
//var q = d3.queue();

// 2-3
(function() {
  
  // Pseudo-global variables
  // Define CSV attributes
  var attrArray = ["NPark", "NMonument", "NPreserve", "NHPark", "NHSite", "IHSite", "NBPark", "NMPark", "NB", "NBSite", "NMemorial", "NRArea", "NSeashore", "NLakeshore", "NRiver", "NReserve", "NParkway", "NTrail", "Other"];
  var expressed = attrArray[0];

  // 2-2
  window.onload = setMap();
  
  // Map visualization
  function setMap() {
  // Map dimensions
  var width = window.innerWidth * 0.6,
      height = 500;
  var map = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width", width)
      .attr("height", height);
  
  // Map projections
  // Center on continental United States
  var projection_US = d3.geoAlbers()
      .center([0, 38]) // Keep longitude as 0
      .rotate([98, 0, 0]) // Keep latitude as 0
      .parallels([25, 50])
      .scale(1000)
      .translate([width/2, height/2]);
  // Center on Alaska
  var projection_AK = d3.geoAlbers()
      .center([0, 62])
      .rotate([158, 0, 0])
      .parallels([55, 70])
      .scale(1300)
      .translate([width/2, height/2]);
  // Center on Hawaii
  var projection_HI = d3.geoAlbers()
      .center([0, 22])
      .rotate([161, 0, 0])
      .parallels([19, 22])
      .scale(3500)
      .translate([width/2, height/2]);
  
  // Map paths
  var path = d3.geoPath()
      .projection(projection_US);
  
  // Data queue 
  d3.queue()
    .defer(d3.csv, "data/nps_sites.csv")
    .defer(d3.json, "data/state_geojson.topojson")
    .await(callback);
  
  function callback(error, csvData, states){
    // Call graticule function
    setGraticule(map, path);
    
    // Define and create SVG
    var usStates = topojson.feature(states, states.objects.state_geojson).features;
    //console.log(usStates);
    
    // Define color scale
    var colorScale = setColorScale(csvData);
    
    // Join CSV to GeoJSON properties
    usStates = joinData(usStates, csvData);
    
    // Call map settings function
    setEnumUnits(usStates, map, path, colorScale);
    
    // Call chart function
    setChart(csvData, colorScale);
    
  };
};
  // Chart visualization
  function setChart(csvData, colorScale) {
    var chartWidth = window.innerWidth * 0.325,
        chartHeight = 500;
    
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
    
    var yScale = d3.scaleLinear()
        .range([0, chartHeight])
        .domain([0, 10]);
    
    var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
        
        .sort(function(a, b) {
          return a[expressed] - b[expressed]
        })
        
        .attr("class", function(d) {
          return "bars " + d.NAME;
        })
        .attr("width", chartWidth/csvData.length - 1)
        .attr("x", function(d, i) {
          return i * (chartWidth/csvData.length);
        })
        .attr("height", function(d) {
          return yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d) {
          return chartHeight - yScale(parseFloat(d[expressed]));
        })
    
        .style("fill", function(d) {
          return helpChoropleth(d, colorScale);
        });
    
    var numbers = chart.selectAll(".numbers")
        .data(csvData)
        .enter()
        .append("text")
        
        .sort(function(a, b) {
          return a[expressed] - b[expressed]
        })
        
        .attr("class", function(d) {
          return "numbers " + d.NAME;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) {
          var fraction = chartWidth / csvData.length;
          return i * fraction + (fraction - 1) / 2;
        })
        .attr("y", function(d) {
          return chartHeight - yScale(parseFloat(d[expressed])) + 15;
        })
        .text(function(d) {
          return d[expressed];
        });
  };
  
  // Color scale generator
  function setColorScale(data) {
    var colorClasses = [
        "#EDF8E9",
        "#BAE4B3",
        "#74C476",
        "#31A354",
        "#006D2C"
    ];
    
    var colorScale = d3.scaleQuantile()
        .range(colorClasses);
    // Quantile
    var domainArray = [];
    for (var i=0; i < data.length; i++) {
      var val = parseFloat(data[i][expressed]);
      domainArray.push(val);
    };
    colorScale.domain(domainArray);
    // Equal Interval
    /*var colorScale = d3.scaleQuantile()
        .range(colorClasses);
    var minmax = [
      d3.min(data, function(d) {return parseFloat(d[expressed]); }),
      d3.max(data, function(d) {return parseFloat(d[expressed]); })
    ];
    colorScale.domain(minmax);*/
    // Natural Breaks
    /*var colorScale = d3.scaleThreshold()
        .range(colorClasses);
    var domainArray = [];
    for (var i=0; i < data.length; i++) {
      var val = parseFloat(data[i][expressed]);
      domainArray.push(val);
    };
    var clusters = ss.ckmeans(domainArray, 5);
    
    domainArray = clusters.map(function(d) {
      return d3.min(d);
    });
    domainArray.shift();
    colorScale.domain(domainArray);*/
    
    console.log(colorScale.quantiles());
    return colorScale;
  };
  // Choropleth helper
  function helpChoropleth(properties, colorScale) {
    var val = parseFloat(properties[expressed]);
    if (typeof val == "number" && !isNaN(val)) {
      return colorScale(val);
    } else {
      return "#EEE";
    };
  };
  
  // Graticule settings 
  function setGraticule(map, path) {
    // Create graticules
    var graticule = d3.geoGraticule()
        .step([5, 5]); // Lng/Lat lines every 5 degrees
    var gratBackground = map.append("path")
        .datum(graticule.outline())
        .attr("class", "gratBackground")
        .attr("d", path)
    var gratLines = map.selectAll(".gratLines")
        .data(graticule.lines())
        .enter()
        .append("path")
        .attr("class", "gratLines")
        .attr("d", path);
  };
  // Data join settings
  function joinData(usStates, csvData) {
    // 2-3
    // Assign attribute values to respective states
    for (var i=0; i < csvData.length; i++) {
      var csvState = csvData[i];
      var csvField = csvState.State;
      
      for (var a=0; a < usStates.length; a++) {
        var geojsonProperties = usStates[a].properties;
        var geojsonField = geojsonProperties.NAME;
        
        // Match and transfer CSV data to GeoJSON object
        if (geojsonField == csvField) {
          attrArray.forEach(function(attr) {
            // Convert strings to numbers
            var val = parseFloat(csvState[attr]);
            geojsonProperties[attr] = val;
          });
        };
        //console.log(geojsonProperties);
      };
    };
    
    return usStates;
  };
  // Map settings
  function setEnumUnits(usStates, map, path, colorScale) {
    var states = map.selectAll(".states")
      .data(usStates)
      .enter()
      .append("path")
      .attr("class", function(d) {
        return "states, " + 
                //d.properties.STUSPS + ", " + 
                d.properties.NAME;
      })
      .attr("d", path)
      .style("fill", function(d) {
        //return colorScale(d.properties[expressed]);
        return helpChoropleth(d.properties, colorScale);
      });
  };
  
})();
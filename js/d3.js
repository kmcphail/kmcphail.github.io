(function() {
  
  // Pseudo-global variables
  // Define CSV attributes
  /*var attrArray = ["NPark", "NMonument", "NPreserve", "NHPark", "NHSite", "IHSite", "NBPark", "NMPark", "NB", "NBSite", "NMemorial", "NRArea", "NSeashore", "NLakeshore", "NRiver", "NReserve", "NParkway", "NTrail", "Other"];*/
  var attrArray = ["National Park", "National Monument", "National Preserve", "National Historical Park", "National Historic Site", "International Historic Site", "National Battlefield Park", "National Military Park", "National Battlefield ", "National Battlefield Site", "National Memorial", "National Recreation Area", "National Seashore", "National Lakeshore", "National River", "National Reserve", "National Parkway", "National Trail", "Other"];
  
  var expressed = attrArray[0]; // 0-18
  
  // Chart dimensions
  var chartWidth = window.innerWidth * 0.325,
        chartHeight = 500,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")"
  ;
  var yScale = d3.scaleLinear()
        .range([490, 0])
        .domain([0, 14])
  ;
  
  
  // 2-2
  window.onload = setMap();
  
  // Map visualization
  function setMap() {
  // Map dimensions
  var width = window.innerWidth * 0.6,
      height = 500
  ;
  var map = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width", width)
      .attr("height", height)
  ;
  /*var svg = 
      .append("path")
      .style("fill", "none")
      .style("stroke", "#000")
      .attr("d", projection.getCompositionBorders());*/
  
  
  // Map projections
  // Center on continental United States
  var projection_US = d3.geoAlbers()
      .center([0, 38]) // Keep longitude as 0
      .rotate([98, 0, 0]) // Keep latitude as 0
      .parallels([25, 50])
      .scale(1000)
      .translate([width/2, height/2])
  ;
  // Center on Alaska
  var projection_AK = d3.geoAlbers()
      .center([0, 62])
      .rotate([158, 0, 0])
      .parallels([55, 70])
      .scale(1300)
      .translate([width/2, height/2])
  ;
  // Center on Hawaii
  var projection_HI = d3.geoAlbers()
      .center([0, 22])
      .rotate([161, 0, 0])
      .parallels([19, 22])
      .scale(3500)
      .translate([width/2, height/2])
  ;
  
  // Map paths
  var path = d3.geoPath()
      .projection(projection_US);
  var path_AK = d3.geoPath()
      .projection(projection_AK);
  var path_HI = d3.geoPath()
      .projection(projection_HI);
  
  // Data queue 
  d3.queue()
    .defer(d3.csv, "data/nps_sites_abbr.csv")
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
    
    // Call dropdown
    createDropdown(csvData);
    
  };
};
  // Chart visualization
  function setChart(csvData, colorScale) {
    
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart")
    ;
    
    var chartBackground = chart.append("rect")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("class", "chartBackground")
        .attr("transform", translate)
    ;
    
    var bars = chart.selectAll(".bar")
        .data(csvData)
        .enter()
        .append("rect")
        
        .sort(function(a, b) {
          return b[expressed] - a[expressed]
        })
        .attr("class", function(d) {
          return "bar " + d.STUSPS;
        })
        .attr("width", chartInnerWidth/csvData.length - 1)
    
        .on("mouseover", highlight)
        .on("mouseout", unhighlight)
        .on("mousemove", moveLabel)
    ;
    
    var desc = bars.append("desc")
        .text('{"stroke": "none", "stroke-width": "0px"}');
    
    var chartTitle = chart.append("text")
        .attr("x", 60)
        .attr("y", 40)
        .attr("class", "chartTitle")
    ;
    
    var yAxis = d3.axisLeft(yScale)
        .scale(yScale)
    ;
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis)
    ;
    
    var chartFrame = chart.append("rect")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("class", "chartFrame")
        .attr("transform", translate)
    ;
    
    /*var numbers = chart.selectAll(".numbers")
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
        })
    ;*/
    
    updateChart(bars, csvData.length, colorScale);
  };
  // Dynamic attribute selection & listener
  function createDropdown(csvData) {
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function() {
          changeAttribute(this.value, csvData)
        })
    ;
    
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select National Site")
    ;
    
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d) {return d})
        .text(function(d) {return d})
    ;
  };
  function changeAttribute(attribute, csvData) {
    expressed = attribute;
    var colorScale = setColorScale(csvData);
    var states = d3.selectAll(".states")
      .transition()
      .duration(1000)
      .style("fill", function(d) {
        return choropleth(d.properties, colorScale)
      })
    ;
    
    var bars = d3.selectAll(".bar")
        // Sort
        .sort(function(a, b) {
          return b[expressed] - a[expressed];
        })
        .transition()
        .delay(function(d, i) {
          return i * 20
        })
        .duration(500)
    ;
    
    updateChart(bars, csvData.length, colorScale);
  };
  function updateChart(bars, n, colorScale) {
    /*var yAxis = d3.axisLeft()
        .scale(yScale);
    d3.selectAll("y.axis")
        .call(yAxis);*/
    // Re-position
    bars.attr("x", function(d, i) {
            return i * (chartInnerWidth/n) + leftPadding;
        })
        
        // Re-size
        .attr("height", function(d, i) {
            return 490 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i) {
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
    
        // Re-color
        .style("fill", function(d) {
            return choropleth(d, colorScale);
        })
    ;
    var chartTitle = d3.select(".chartTitle")
        .text("Number of " + expressed + "s")
    ;
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
    
    //console.log(colorScale.quantiles());
    return colorScale;
  };
  // Choropleth helper
  function choropleth(properties, colorScale) {
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
        .step([5, 5]) // Lng/Lat lines every 5 degrees
    ;
    var gratBackground = map.append("path")
        .datum(graticule.outline())
        .attr("class", "gratBackground")
        .attr("d", path)
    ;
    var gratLines = map.selectAll(".gratLines")
        .data(graticule.lines())
        .enter()
        .append("path")
        .attr("class", "gratLines")
        .attr("d", path)
    ;
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
        //var geojsonField = geojsonProperties.NAME;
        var geojsonField = geojsonProperties.STUSPS;
        
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
        return "states " + d.properties.STUSPS;
      })
      .attr("d", path)
      .style("fill", function(d) {
        return choropleth(d.properties, colorScale);
      })
      /*.attr("d", path(projection.getCompositionBorders()))*/
      
      .on("mouseover", function(d) {
        highlight(d.properties);
      })
      .on("mouseout", function(d) {
        unhighlight(d.properties);
      })
      .on("mousemove", moveLabel);
    ;
    
    var desc = states.append("desc")
        .text('{"stroke": "#000", "stroke-width": "0.5px"}');
  };
  function highlight(properties) {
    // Stroke
    var selected = d3.selectAll("." + properties.STUSPS)
        .style("stroke", "white")
        .style("stroke-width", "1.5")
    ;
    setLabel(properties);
  };
  function unhighlight(properties) {
    // Stroke
    var selected = d3.selectAll("." + properties.STUSPS)
        .style("stroke", function() {
          return getStyle(this, "stroke")
        })
        .style("stroke-width", function() {
          return getStyle(this, "stroke-width")
        })
    ;
    
    function getStyle(element, styleName) {
      var styleText = d3.select(element)
          .select("desc")
          .text();
      var styleObject = JSON.parse(styleText);
      
      return styleObject[styleName];
    };
    
    d3.select(".infolabel")
      .remove();
  };
  
  // Label functions
  function setLabel(properties) {
    var labelAttr = "<h1>" + properties[expressed] + 
                    "</h1><b>" + expressed + "</b>"
    ;
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", properties.STUSPS + "_label")
        .html(labelAttr)
    ;
    var stateName = infolabel.append("div")
        .attr("class", "labelname")
        .html(properties.NAME)
    ;
  };
  function moveLabel() {
    // Get width 
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;
    
    // Set label coordinates
    var x1 = d3.event.clientX + 10,
        y1 = d3.event.clientY - 55,
        x2 = d3.event.clientX - labelWidth - 10,
        y2 = d3.event.clientY + 25;
    
    // Test for map edge conflicts
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2:x1;
    var y = d3.event.clientY < 75 ? y2:y1;
    
    d3.select(".infolabel")
      .style("left", x + "px")
      .style("top", y + "px")
    ;
  };
    
})();
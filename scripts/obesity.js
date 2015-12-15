var outerWidth = 900,
   outerHeight = 570;

var mapMargin = {top: 30, right: 30, bottom: 10, left: 10};
var width = outerWidth - mapMargin.left - mapMargin.right,
	height = outerHeight - mapMargin.top - mapMargin.bottom;
	
var tooltip = d3.select("body").append("div").attr("class", "tooltip hidden");
   
var rateById = d3.map();
var rateChangeById = d3.map();

var quantize = d3.scale.quantize()
    .domain([10, 25])
    .range(d3.range(9).map(function(i) {return "q" + i + "-9"; }));

var projection = d3.geo.mercator()
		.center([-71.90, 42.97]) //.center([-70.00, 42.68])
		.scale(12000)
		.translate([width / 2, height / 33]);
		//.attr('transform', 'translate(' + mapMargin.left + ',' + mapMargin.top + ')');

var path = d3.geo.path()
		.projection(projection);  //projection

var fixedLeft = d3.select(".fixed-left");
var svg_map = fixedLeft.select('.side-map').append('svg')
				.attr("width", width)
				.attr("height", height);
  
//var svg_map = d3.select("body").append("svg")
  //  .attr("width", width)
    //.attr("height", height);
	
queue()
    .defer(d3.json, "ma-counties.json")
    .defer(d3.csv, "data/data2014_health.csv", function(d) {  rateById.set(d.id, +d.Rate11); rateChangeById.set(d.id, +d.Change); })
    .await(ready);
	
function ready(error, ma) {
  if (error) throw error;
	var county = svg_map.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(ma.features)
    .enter().append("path")
      .attr("class", function(d) {return quantize(rateById.get(d.properties.id)); })
      .attr("d", path)
	  .attr("id",function(d) {return d.properties.name})
	  .on("mousedown", function() {
			showCountyDetails(this);
			dispatch.countyChange(this.id);
		});
	  var currentState;
	//tooltips
    county.on("mouseover", function(d,i){

    		 var mouse = d3.mouse(svg_map.node()).map( function(d) { return parseInt(d); } );      
    	       currentState = this;
               d3.select(this).style('fill-opacity', 1);

               var thoseStates = d3
                       .selectAll('path')[0]
                       .filter(function(state) {
                           return state !== currentState;
                       });

               d3.selectAll(thoseStates)
                       .style({
                           'fill-opacity':.5
                       });

              tooltip.classed("hidden", false)
		         .attr("style", "left:"+(mouse[0]+20)+"px;top:"+(mouse[1]+300)+"px")
		         .html(displayChange(d.properties.id, d.properties.name));   

               })
                .on('mouseout', function(d, i) {
 					tooltip.classed("hidden", true)
 					.attr("style","z-index:-1;")
 					
                    d3.selectAll('path')
                            .style({'fill-opacity':1
                            });
                })
  
  svg_map.append("g")
      .attr("class", "names")
	  .selectAll(".county-label")
    .data(ma.features)
  .enter().append("text")
    .attr("class", function(d) { return "county-label " + d.properties.id; })
    .attr("transform", function(d) {return "translate(" + (path.centroid(d)[0] -27) +","+ (path.centroid(d)[1]+8) + ")"; }) //path.centroid(d)
    .attr("dy", ".35em")
    .text(function(d) { return d.properties.name; });	
}

function displayChange(countyId, county){
	var format = d3.format(".2n");
	var formatter = d3.format("0"); 
	var changePCT = rateChangeById.get(countyId);
	if (changePCT > 0){
		return "<b>" + county +"</b><br/>Increase by " + format(changePCT) + "% from 2008."
	}
	else if (changePCT < 0){
		return "<b>" + county +"</b><br/>Decrease by " + formatter(format(-changePCT)) + "% from 2008."
	}
	else if (changePCT == 0){
		return "<b>" + county +"</b><br/>No change since 2008."
	}
}

function showCountyDetails(county){
		console.log(county.id);
	}

d3.select(self.frameElement).style("height", height + "px");

//linear gradient key
var w = 850, h = 60;

var mfixedLeft = d3.select("#mapLegFC");
var key = mfixedLeft.select('.map-legend').append('svg')
		  .attr("id", "key")
		  .attr("width", w)
		  .attr("height", h);
			
var legend = key.append("defs")
				.append("svg:linearGradient")
				.attr("id", "gradient")
				.attr("x1","0%")
				.attr("x2","100%")
				.attr("y1","0%")
				.attr("y2","0%")
				.attr("spreadMethod", "pad");
				
legend.selectAll("stop")
	.data([
	{offset: "0%", color: "#fff5eb"},
	{offset: "15%", color: "#fdae6b"},
	{offset: "50%", color: "#fd8d3c"},
	{offset: "60%", color: "#d94801"},
	{offset: "100%", color: "#7f2704"}
  ])
.enter().append("stop")
  .attr("offset", function(d) { return d.offset; })
  .attr("stop-color", function(d) {return d.color; })
  .attr("stop-opacity", 1);

key.append("rect")
	.attr("width", 300)
	.attr("height", 15)
	.style("fill", "url(#gradient)")
	.attr("transform", "translate(250,2)");

var y = d3.scale.linear()
		.range([300, 0])
		.domain([25, 10]);

var yAxis = d3.svg.axis()
			.scale(y)
			.orient("bottom");

key.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(250,2)")
	.call(yAxis).append("text")
	.attr("transform", "translate(270,2)")
	.attr("y", 20).attr("dy", ".71em")
	.style("text-anchor", "end").text("% Obesity rate");
//end key











// Constants
var AVERAGE = "Average"
var MOST_OBESE = "Most obese"
var LEAST_OBESE = "Least obese"

// Global Variables for ALL charts
var selectedCounty = "Worcester";

// Customized Global Variables: ---
// Race Variables
var raceComparisonMap = d3.map();
var raceCountyMap = d3.map();
var raceSelectedComparison = AVERAGE;
var raceColumnNames;

// Age Variables
var ageComparisonMap = d3.map();
var ageCountyMap = d3.map();
var ageSelectedComparison = AVERAGE;
var ageColumnNames;

// Income Variables
var incomeComparisonMap = d3.map();
var incomeCountyMap = d3.map();
var incomeSelectedComparison = AVERAGE;
var incomeColumnNames;
// Factor Variables

// Program Variables
var programComparisonMap = d3.map();
var programCountyMap = d3.map();
var programSelectedComparison = AVERAGE;
var programColumnNames;

// Factors variables
var factorComparisonMap = d3.map();
var factorCountyMap = d3.map();
var factorSelectedComparison = AVERAGE;
var factorColumnNames;

// Create events
var dispatch = d3.dispatch("countyChange",
    "updateGraphProgram", "loadMenuProgram",
    "updateGraphRace", "loadMenuRace",
    "updateGraphAge", "loadMenuAge",
    "updateGraphIncome", "loadMenuIncome",
    "updateGraphFactor", "loadMenuFactor");

// Style
var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    },
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.ordinal()
    //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    .range(["#e31a1c", "#feb24c", "#fd8d3c", "#ffeda0", "#fc4e2a", "#bd0026", "#fed976", "#800026"]);

var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

function prepData(data, columnNames, comparisonMap, comparisonKey) {
    data.forEach(function(d) {
          // console.log(data)
        d.columns = columnNames.map(function(name) {
           
            return {
                name: name,
                value: +d[name]

            };
        });
        // console.log(d, d.columns)
    });
    comparisonMap.set(comparisonKey, data);

}

/**
 * Data loading code
 */
// Load main data file
d3.csv("data/data2014_foodPrograms.csv", function(error, allDataRows) {
    if (error) throw error;

    // programColumnNames stores the names of all data attributes
    programColumnNames = d3.keys(allDataRows[0]).filter(function(key) {
        return key !== "County";
    });

    allDataRows.forEach(function(d) {
        d.columns = programColumnNames.map(function(name) {
            return {
                name: name,
                value: +d[name]
            };
        });
    });

    // programCountyMap maps (county -> one_row_of_csv_data)
    allDataRows.forEach(function(d) {
        programCountyMap.set(d.County, d);
    });

    // Load least obese data
    d3.csv("data/data2014_foodPrograms_LeastObese.csv", function(error, leastObeseData) {
        if (error) throw error;
        // Adds (LEAST_OBESE -> leastObeseData) to programComparisonMap
        prepData(leastObeseData, programColumnNames, programComparisonMap, LEAST_OBESE);

        // Load most obese data
        d3.csv("data/data2014_foodPrograms_MostObese.csv", function(error, mostObeseData) {
            if (error) throw error;
            // Adds (MOST_OBESE -> mostObeseData) to programComparisonMap
            prepData(mostObeseData, programColumnNames, programComparisonMap, MOST_OBESE);

            // Load average data
            d3.csv("data/data2014_foodPrograms_Average.csv", function(error, average) {
                if (error) throw error;
                // Adds (AVERAGE -> average) to programComparisonMap
                prepData(average, programColumnNames, programComparisonMap, AVERAGE);

                // send load event
                dispatch.loadMenuProgram(programCountyMap, programComparisonMap, programColumnNames);
                // send updateGraphs event
                dispatch.updateGraphProgram(programCountyMap.get(selectedCounty),
                    programComparisonMap.get(programSelectedComparison),
                    programColumnNames);
            });
        });
    });
});


/**
 * Common listener for anywhere county changes
 */
dispatch.on("countyChange.everywhere", function(selectedCounty) {

    // console.log(raceColumnNames, raceCountyMap.get(selectedCounty), programCountyMap.get(selectedCounty))
    // console.log(selectedCounty)
    // Dispatch updateGraphProgram event
    dispatch.updateGraphProgram(programCountyMap.get(selectedCounty),
        programComparisonMap.get(programSelectedComparison),
        programColumnNames);

    // dispatch.updateGraphRace()
    // console.log(raceColumnNames+"Inside common func" + programColumnNames)

    dispatch.updateGraphRace(raceCountyMap.get(selectedCounty),
        raceComparisonMap.get(raceSelectedComparison),
        raceColumnNames);

    // dispatch.updateGraphAge()
    dispatch.updateGraphAge(ageCountyMap.get(selectedCounty),
        ageComparisonMap.get(ageSelectedComparison),
        ageColumnNames);

    // dispatch.updateGraphIncome
      dispatch.updateGraphIncome(incomeCountyMap.get(selectedCounty),
        incomeComparisonMap.get(incomeSelectedComparison),
        incomeColumnNames);

      // dispatch.updateGraphFactor
    dispatch.updateGraphFactor(factorCountyMap.get(selectedCounty),
        factorComparisonMap.get(factorSelectedComparison),
        factorColumnNames);
})


/**
 * Code for program graph
 */
// Add listener for menu "loadMenuProgram" event
dispatch.on("loadMenuProgram.programCountyMenu", function(programCountyMap, programComparisonMap, programColumnNames) {
    // Draw the drop-down menu for selecting a County
    var select = d3.select("#countyFilter3")
        .append("select")
		.attr("class", "select-county")
        .on("change", function() { // Add listener for when menu changes
            dispatch.countyChange(this.value);
        });

    // Populate menu with options
    select.selectAll("option")
        .data(programCountyMap.values())
        .enter()
        .append("option")
        .attr("value", function(d) {
            return d.County;
        })
        .text(function(d) {
            return d.County;
        });

    // Add listener for "updateGraphs" event
    dispatch.on("updateGraphProgram.countymenu", function(selectedCountyData, selectedComparisonData, programColumnNames) {
        selectedCounty = selectedCountyData.County;
        select.property("value", selectedCounty);
          // console.log(selectedCounty +"P HI")
    });
});

// Add listener for "loadMenuProgram" event
dispatch.on("loadMenuProgram.programCompareMenu", function(programCountyMap, programComparisonMap, programColumnNames) {
    // Draw the drop-down menu for selecting a comparison data
    var select = d3.select("#program_menu")
        .append("select")		
		.attr("class", "select-county")
        .on("change", function() { // Add listener for when menu changes
            programSelectedComparison = this.value;
            dispatch.updateGraphProgram(programCountyMap.get(selectedCounty),
                programComparisonMap.get(programSelectedComparison),
                programColumnNames);
        });

    // Populate menu with options
    select.selectAll("option")
        .data(programComparisonMap.keys())
        .enter()
        .append("option")
        .attr("value", function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        });

    // Add listener for "updateGraphs" event
    dispatch.on("updateGraphProgram.comparemenu", function(selectedCountyData, selectedComparisonData, programColumnNames) {
        select.property("value", programSelectedComparison);
    });
});

// Add listener for "updateGraphs" event
dispatch.on("updateGraphProgram.bar",
    function(selectedCountyData, selectedComparisonData, programColumnNames) {
		var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
		},
		width = 700 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

		var x0 = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);

		var x1 = d3.scale.ordinal();

		var y = d3.scale.linear()
			.range([height, 0]);

		var color = d3.scale.ordinal()
			//.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
			.range(["#e31a1c", "#feb24c", "#fd8d3c", "#ffeda0", "#fc4e2a", "#bd0026", "#fed976", "#800026"]);

		var xAxis = d3.svg.axis()
			.scale(x0)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(d3.format(".2s"));
        // Remove existing svg
        d3.selectAll("#program_bar svg").remove();
        // Draw the bar chart
        var svg = d3.select("#program_bar").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Create a new dataset by adding selected county data to comparison data
        // That is, compare to most obese, lease obese, average etc.
        var barChartData = selectedComparisonData.concat(selectedCountyData);

        x0.domain(barChartData.map(function(d) {
            return d.County;
        }));
        x1.domain(programColumnNames).rangeRoundBands([0, x0.rangeBand()]);
        y.domain([0, d3.max(barChartData, function(d) {
            return d3.max(d.columns, function(d) {
                return d.value;
            });
        })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Percent");

        var state = svg.selectAll(".state")
            .data(barChartData)
            .enter().append("g")
            .attr("class", "bars")
            .attr("transform", function(d) {
                return "translate(" + x0(d.County) + ",0)";
            })
            .attr("tx", function(d) {
                return x0(d.County);
            });

        state.selectAll("rect")
            .data(function(d) {
                return d.columns;
            })
            .enter().append("rect")
            .attr("width", x1.rangeBand())
            .attr("x", function(d) {
                return x1(d.name);
            })
            .attr("y", function(d) {
                return y(d.value);
            })
            .attr("height", function(d) {
                return height - y(d.value);
            })
            .style("fill", function(d) {
                return color(d.name);
            });

        //tooltip
        state.selectAll("rect")
        .on("mouseover", function (d) {
            d3.select(this).attr("stroke", "blue").attr("stroke-width", 0.8);
                    // console.log(d)
            d3.select("#tab_tooltip")
                .style("left", d3.event.pageX  + "px")
                .style("top", d3.event.pageY + "px")
                .style("opacity", 1)
                .select("#value")
                .text(d.name +": " + Math.round(d.value * 10)/10);
            })

            .on("mouseout", function () {
            // Hide the tooltip
                d3.select("#tab_tooltip")
                    .style("opacity", 0);
                d3.select(this).attr("stroke", "pink").attr("stroke-width", 0.2);
        });

        //legend
        var legend = svg.selectAll(".legend")
            .data(programColumnNames.slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", width )
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 10)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {
                return d;
            })
			.style("font-size","10px");
    })

/**
 * Code for Factors graph
 */
d3.csv("data/data2014_Factors_AllCounties.csv", function(error, allDataRows) {
    if (error) throw error;

    // factorColumnNames stores the names of all data attributes
    factorColumnNames = d3.keys(allDataRows[0]).filter(function(key) {
        return key !== "County";
    });

    allDataRows.forEach(function(d) {
        d.columns = factorColumnNames.map(function(name) {
            return {
                name: name,
                value: +d[name]
            };
        });
    });

    // factorCountyMap maps (county -> one_row_of_csv_data)
    allDataRows.forEach(function(d) {
        factorCountyMap.set(d.County, d);
    });

    // Load least obese data
    d3.csv("data/data2014_Factors_LeastObese.csv", function(error, leastObeseData) {
        if (error) throw error;
        // Adds (LEAST_OBESE -> leastObeseData) to factorComparisonMap
        prepData(leastObeseData, factorColumnNames, factorComparisonMap, LEAST_OBESE);

        // Load most obese data
        d3.csv("data/data2014_Factors_MostObese.csv", function(error, mostObeseData) {
            if (error) throw error;
            // Adds (MOST_OBESE -> mostObeseData) to factorComparisonMap
            prepData(mostObeseData, factorColumnNames, factorComparisonMap, MOST_OBESE);

            // Load average data
            d3.csv("data/data2014_Factors_Average.csv", function(error, average) {
                if (error) throw error;
                // Adds (AVERAGE -> average) to factorComparisonMap
                prepData(average, factorColumnNames, factorComparisonMap, AVERAGE);

                // send load event
                dispatch.loadMenuFactor(factorCountyMap, factorComparisonMap, factorColumnNames);
                // send updateGraphs event
                dispatch.updateGraphFactor(factorCountyMap.get(selectedCounty),
                    factorComparisonMap.get(factorSelectedComparison),
                    factorColumnNames);
            });
        });
    });
});

dispatch.on("loadMenuFactor.factorCountyMenu", function(factorCountyMap, factorComparisonMap, factorColumnNames) {
    // Draw the drop-down menu for selecting a County
    var select = d3.select("#countyFilter2")
        .append("select")
		.attr("class","select-county")
        .on("change", function() { // Add listener for when menu changes
            dispatch.countyChange(this.value);
        });

    // Populate menu with options
    select.selectAll("option")
        .data(factorCountyMap.values())
        .enter()
        .append("option")
        .attr("value", function(d) {
            return d.County;
        })
        .text(function(d) {
            return d.County;
        });

    // Add listener for "updateGraphs" event
    dispatch.on("updateGraphFactor.countymenu", function(selectedCountyData, selectedComparisonData, factorColumnNames) {
        selectedCounty = selectedCountyData.County;
        select.property("value", selectedCounty);
    });
});

// Add listener for "loadMenuFactor" event
dispatch.on("loadMenuFactor.factorCompareMenu", function(factorCountyMap, factorComparisonMap, factorColumnNames) {
    // Draw the drop-down menu for selecting a comparison data
    var select = d3.select("#factors_menu")
        .append("select")
		.attr("class", "select-county")
        .on("change", function() { // Add listener for when menu changes
            factorSelectedComparison = this.value;
            dispatch.updateGraphFactor(factorCountyMap.get(selectedCounty),
                factorComparisonMap.get(factorSelectedComparison),
                factorColumnNames);
        });

    // Populate menu with options
    select.selectAll("option")
        .data(factorComparisonMap.keys())
        .enter()
        .append("option")
        .attr("value", function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        });

    // Add listener for "updateGraphs" event
    dispatch.on("updateGraphFactor.comparemenu", function(selectedCountyData, selectedComparisonData, factorColumnNames) {
        select.property("value", factorSelectedComparison);
    });
});

// Add listener for "updateGraphs" event
dispatch.on("updateGraphFactor.bar",
    function(selectedCountyData, selectedComparisonData, factorColumnNames) {
		var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
			},
			width = 700 - margin.left - margin.right,
			height = 400 - margin.top - margin.bottom;

		var x0 = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);

		var x1 = d3.scale.ordinal();

		var y = d3.scale.linear()
			.range([height, 0]);

		var color = d3.scale.ordinal()
			//.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
			.range(["#e31a1c", "#feb24c", "#fd8d3c", "#ffeda0", "#fc4e2a", "#bd0026", "#fed976", "#800026"]);

		var xAxis = d3.svg.axis()
			.scale(x0)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(d3.format(".2s"));
        // Remove existing svg
        d3.select("#factors_bar svg").remove();
        // Draw the bar chart
        var svg = d3.select("#factors_bar").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Create a new dataset by adding selected county data to comparison data
        // That is, compare to most obese, lease obese, average etc.
        var barChartData = selectedComparisonData.concat(selectedCountyData);

        x0.domain(barChartData.map(function(d) {
            return d.County;
        }));
        x1.domain(factorColumnNames).rangeRoundBands([0, x0.rangeBand()]);
        y.domain([0, d3.max(barChartData, function(d) {
            return d3.max(d.columns, function(d) {
                return d.value;
            });
        })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Percent");

        var state = svg.selectAll(".state")
            .data(barChartData)
            .enter().append("g")
            .attr("class", "bars")
            .attr("transform", function(d) {
                return "translate(" + x0(d.County) + ",0)";
            })
            .attr("tx", function(d) {
                return x0(d.County);
            });

        state.selectAll("rect")
            .data(function(d) {
                return d.columns;
            })
            .enter().append("rect")
            .attr("width", x1.rangeBand())
            .attr("x", function(d) {
                return x1(d.name);
            })
            .attr("y", function(d) {
                return y(d.value);
            })
            .attr("height", function(d) {
                return height - y(d.value);
            })
            .style("fill", function(d) {
                return color(d.name);
            });

        //tooltip
        state.selectAll("rect")
        .on("mouseover", function (d) {
            d3.select(this).attr("stroke", "blue").attr("stroke-width", 0.8);
                    // console.log(d)
            d3.select("#tab_tooltip")
                .style("left", d3.event.pageX  + "px")
                .style("top", d3.event.pageY + "px")
                .style("opacity", 1)
                .select("#value")
                .text(d.name +": " + Math.round(d.value * 10)/10);
            })

            .on("mouseout", function () {
            // Hide the tooltip
                d3.select("#tab_tooltip")
                    .style("opacity", 0);
                d3.select(this).attr("stroke", "pink").attr("stroke-width", 0.2);
        });

        //legend
        var legend = svg.selectAll(".legend")
            .data(factorColumnNames.slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", width )
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 5)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {
                return d;
            })
			.style("font-size","10px");
    })


/**
 * Code for race graph
 */


d3.csv("data/Race.csv", function(error, allDataRows) {
    if (error) throw error;

     raceColumnNames = d3.keys(allDataRows[0]).filter(function(key) {

        return key !== "County";
    });
     // console.log(raceColumnNames)

    allDataRows.forEach(function(d) {
        d.columns = raceColumnNames.map(function(name) {
            return {
                name: name,
                value: +d[name]
            };
        });
    });

    // console.log(allDataRows)
   // raceCountyMap = d3.map();
    allDataRows.forEach(function(d) {
        // console.log(d+"DKFKKFK")
        raceCountyMap.set(d.County, d);
    });


    d3.csv("data/race_LeastObese.csv", function(error, race_leastObeseData) {
        // console.log(race_leastObeseData)
        if (error) throw error;
        prepData(race_leastObeseData, raceColumnNames, raceComparisonMap, LEAST_OBESE);

    //     // console.log(raceComparisonMap.get(raceSelectedComparison) + "Prep")

        d3.csv("data/race_mostObese.csv", function(error, race_mostObeseData) {
            if (error) throw error;
            prepData(race_mostObeseData, raceColumnNames, raceComparisonMap, MOST_OBESE);

            d3.csv("data/race_average.csv", function(error, race_average) {
                if (error) throw error;
                prepData(race_average, raceColumnNames, raceComparisonMap, AVERAGE);

                 dispatch.loadMenuRace(raceCountyMap, raceComparisonMap, raceColumnNames);
                 // console.log(raceComparisonMap.get(raceSelectedComparison))
                 dispatch.updateGraphRace(raceCountyMap.get(selectedCounty), raceComparisonMap.get(raceSelectedComparison), raceColumnNames);
            });
        });
    });
});


// Add listener for menu "loadMenuRace" event
dispatch.on("loadMenuRace.raceCountyMenu", function(raceCountyMap, raceComparisonMap, raceColumnNames) {


    // Draw the drop-down menu for selecting a County
    var select = d3.select("#countyFilter")
        .append("select")
		.attr("class","select-county")
        .on("change", function() { 
        // Add listener for when menu changes
        // console.log(this.value)
            dispatch.countyChange(this.value);
        });

    // Populate menu with options
    select.selectAll("option")
        .data(raceCountyMap.values())
        .enter()
        .append("option")
        .attr("value", function(d) {
            return d.County;
        })
        .text(function(d) {
            return d.County;
        });

    // Add listener for "updateGraphs" event
    dispatch.on("updateGraphRace.countymenu", function(selectedCountyData, selectedComparisonData, raceColumnNames) {
        selectedCounty = selectedCountyData.County;
        select.property("value", selectedCounty);
           // console.log(selectedCounty +"P HI"+ raceColumnNames)
    });
});

// Add listener for "loadMenuRace" event

dispatch.on("loadMenuRace.raceCompareMenu", function(raceCountyMap, raceComparisonMap, raceColumnNames) {
    // Draw the drop-down menu for selecting a comparison data
    var select = d3.select("#race_menu")
        .append("div")
        .append("select")
		.style("width", "150px")
        .on("change", function() { // Add listener for when menu changes
            raceSelectedComparison = this.value;
            dispatch.updateGraphRace(raceCountyMap.get(selectedCounty),
                raceComparisonMap.get(raceSelectedComparison),
                raceColumnNames);
        });

    // Populate menu with options
    select.selectAll("option")
        .data(raceComparisonMap.keys())
        .enter()
        .append("option")
        .attr("value", function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        });

         // console.log(raceComparisonMap.keys())

    // Add listener for "updateGraphs" event
    dispatch.on("updateGraphRace.comparemenu", function(selectedCountyData, selectedComparisonData, raceColumnNames) {

        select.property("value", raceSelectedComparison);
    });

      // console.log("compare HI"+ raceColumnNames)
});
// Add listener
dispatch.on("updateGraphRace.bar", function(selectedCountyData, selectedComparisonData, raceColumnNames) {
    var race_width=380- margin.left - margin.right,
    race_height = 300 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
    .rangeRoundBands([0, race_width]);

    // var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
    .range([race_height, 0]);


    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));
      // console.log("hi")
     // console.log(selectedComparisonData[0].columns)
    d3.select("#race_bar svg").remove();
    var svg = d3.select("#race_bar").append("svg")
        .attr("width", race_width + margin.left + margin.right)
        .attr("height", race_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    x.domain(raceColumnNames)
    y.domain([0,91.4])

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + race_height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
    //     .style("text-anchor", "end")
    //     .text("Percent");

  svg.append("g").attr("class", "y label")
      .attr("transform", "rotate(-90)")
      .append("text").attr("x", -(race_height)/2)
      .attr("y",-30).attr("text-anchor", "middle")
      .text("Percentage")
	  .style("font-size","10px"); 

    var state = svg.selectAll(".state")
        .data(selectedCountyData.columns)
        .enter().append("g")
        .attr("class", "bars")

    state.selectAll("rect")
        .data(selectedCountyData.columns)
        .enter().append("rect")
        .attr("width", function(d){ return x.rangeBand(d)/1.5})
        .attr("x", function(d) {
            return x(d.name);
        })
        .attr("y", function(d) {
            // console.log(d.value)
            return y(d.value);
        })
        .attr("height", function(d) {
            return race_height - y(d.value);
        })
        .style("fill", function(d) {
            return color(d.name);
        });

    state.selectAll("rect")
        .on("mouseover", function (d) {
            d3.select(this).attr("stroke", "blue").attr("stroke-width", 0.8);
                    // console.log(d)
            d3.select("#tab_tooltip")
                .style("left", d3.event.pageX  + "px")
                .style("top", d3.event.pageY + "px")
                .style("opacity", 1)
                .select("#value")
                .text(d.name +": " + d.value);
            })

            .on("mouseout", function () {
            // Hide the tooltip
                d3.select("#tab_tooltip")
                    .style("opacity", 0);
                d3.select(this).attr("stroke", "pink").attr("stroke-width", 0.2);
            });

        var line = d3.svg.line()
                .x(function(d,i) {
                  if (i==0){
                    return x(d.name);
                  }
                  else if(i==selectedComparisonData[0].columns.length-1){
                    // console.log(x(d.name)+10, y(d.value))
                    return x(d.name)+65;
                  }
                  else
                    return x(d.name)+35;
                 })
                .y(function(d) {  
                         // console.log( d.value, y(d.value)); 
                         return y(d.value);
                }); 

                svg.append("path")
                  .datum(selectedComparisonData[0].columns)
                  .attr("class", "line")
                  .attr("d", line); 

                  // console.log("HIHIHI")

  // console.log("First time" +raceColumnNames)
})

/**
 * Code for age graph
 */

d3.csv("data/age.csv", function(error, age_allDataRows) {
    if (error) throw error;

     ageColumnNames = d3.keys(age_allDataRows[0]).filter(function(key) {

        return key !== "County";
    });
     // console.log(raceColumnNames)

    age_allDataRows.forEach(function(d) {
        d.columns = ageColumnNames.map(function(name) {
            return {
                name: name,
                value: +d[name]
            };
        });
    });

    // console.log(age_allDataRows)
   // raceCountyMap = d3.map();
    age_allDataRows.forEach(function(d) {
        // console.log(d+"DKFKKFK")
        ageCountyMap.set(d.County, d);
    });


    d3.csv("data/age_LeastObese.csv", function(error, age_leastObeseData) {
        // console.log(race_leastObeseData)
        if (error) throw error;
        prepData(age_leastObeseData, ageColumnNames, ageComparisonMap, LEAST_OBESE);

    //     // console.log(raceComparisonMap.get(raceSelectedComparison) + "Prep")

        d3.csv("data/age_mostObese.csv", function(error, age_mostObeseData) {
            if (error) throw error;
            prepData(age_mostObeseData, ageColumnNames, ageComparisonMap, MOST_OBESE);

            d3.csv("data/age_average.csv", function(error, age_average) {
                if (error) throw error;
                prepData(age_average, ageColumnNames, ageComparisonMap, AVERAGE);

                 dispatch.loadMenuAge(ageCountyMap, ageComparisonMap, ageColumnNames);
                 // console.log(raceComparisonMap.get(raceSelectedComparison))
                 dispatch.updateGraphAge(ageCountyMap.get(selectedCounty), ageComparisonMap.get(ageSelectedComparison), ageColumnNames);
            });
        });
    });
});

// Add listener for "loadMenuRace" event
dispatch.on("loadMenuAge.ageCompareMenu", function(ageCountyMap, ageComparisonMap, ageColumnNames) {
    // Draw the drop-down menu for selecting a comparison data
    var select = d3.select("#age_county_menu")
        .append("div")
        .append("select")
		.style("width", "150px")
        .on("change", function() { // Add listener for when menu changes
            ageSelectedComparison = this.value;
            dispatch.updateGraphAge(ageCountyMap.get(selectedCounty),
                ageComparisonMap.get(ageSelectedComparison),
                ageColumnNames);
        });

    // Populate menu with options
    select.selectAll("option")
        .data(ageComparisonMap.keys())
        .enter()
        .append("option")
        .attr("value", function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        });

    // Add listener for "updateGraphs" event
    dispatch.on("updateGraphAge.acomparemenu", function(selectedCountyData, selectedComparisonData, ageColumnNames) {

        select.property("value", ageSelectedComparison);
    });

      // console.log("compare HI"+ raceColumnNames)
});

dispatch.on("updateGraphAge.bar", function(selectedCountyData, selectedComparisonData, ageColumnNames) {

    // console.log("First time" +raceColumnNames)

    var race_width=300- margin.left - margin.right,
        race_height = 300 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
     .rangeRoundBands([0, race_width]);

    // var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([race_height, 0]);


    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));
          // console.log("hi")
         // console.log(selectedComparisonData[0].columns)
        d3.select("#age_bar svg").remove();
        var svg = d3.select("#age_bar").append("svg")
            .attr("width", race_width + margin.left + margin.right)
            .attr("height", race_width + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        x.domain(ageColumnNames)
        y.domain([0,25])

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + race_height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Percent");

        var state = svg.selectAll(".state")
            .data(selectedCountyData.columns)
            .enter().append("g")
            .attr("class", "bars")

        state.selectAll("rect")
            .data(selectedCountyData.columns)
            .enter().append("rect")
            .attr("width", function(d){ return (x.rangeBand(d)/3.5)})
            .attr("x", function(d,i) {

                return x(d.name)+75
            //     if (i==0){
            //         return x(d.name)+60;
            //     }
            //     else 
            //         return  x(d.name);
                
             })
            .attr("y", function(d) {
                // console.log(d.value)
                return y(d.value);
            })
            .attr("height", function(d) {
                return race_height - y(d.value);
            })
            .style("fill", function(d) {
                return color(d.name);
            });

        state.selectAll("rect")
            .on("mouseover", function (d) {
            d3.select(this).attr("stroke", "blue").attr("stroke-width", 0.8);
                    // console.log(d)
            d3.select("#tab_tooltip")
                .style("left", d3.event.pageX  + "px")
                .style("top", d3.event.pageY + "px")
                .style("opacity", 1)
                .select("#value")
                .text(d.name +": " + d.value);
            })

            .on("mouseout", function () {
            // Hide the tooltip
                d3.select("#tab_tooltip")
                    .style("opacity", 0);
                d3.select(this).attr("stroke", "pink").attr("stroke-width", 0.2);
            });

            var line = d3.svg.line()
                    .x(function(d,i) {
                      if (i==0){
                        return x(d.name);
                      }

                      else
                        return x(d.name)+110;
                     })
                    .y(function(d) {  
                             // console.log( d.value, y(d.value)); 
                             return y(d.value);
                    }); 

                    // console.log(selectedComparisonData[0].columns)
                    svg.append("path")
                      .datum(selectedComparisonData[0].columns)
                      .attr("class", "line")
                      .attr("d", line); 

                      // console.log("HIHIHI")

      // console.log("First time" +raceColumnNames)
})

//// Code for Income
d3.csv("data/income.csv", function(error, income_allDataRows) {
    if (error) throw error;

     incomeColumnNames = d3.keys(income_allDataRows[0]).filter(function(key) {

        return key !== "County";
    });
     // console.log(raceColumnNames)

    income_allDataRows.forEach(function(d) {
        d.columns = incomeColumnNames.map(function(name) {
            return {
                name: name,
                value: +d[name]
            };
        });
    });

    // console.log(income_allDataRows)
   // raceCountyMap = d3.map();
    income_allDataRows.forEach(function(d) {
        // console.log(d+"DKFKKFK")
        incomeCountyMap.set(d.County, d);
    });


    d3.csv("data/income_LeastObese.csv", function(error, income_leastObeseData) {
        // console.log(race_leastObeseData)
        if (error) throw error;
        prepData(income_leastObeseData, incomeColumnNames, incomeComparisonMap, LEAST_OBESE);

    //     // console.log(raceComparisonMap.get(raceSelectedComparison) + "Prep")

        d3.csv("data/income_mostObese.csv", function(error, income_mostObeseData) {
            if (error) throw error;
            prepData(income_mostObeseData, incomeColumnNames, incomeComparisonMap, MOST_OBESE);

            d3.csv("data/income_average.csv", function(error, income_average) {
                if (error) throw error;
                prepData(income_average, incomeColumnNames, incomeComparisonMap, AVERAGE);

                 dispatch.loadMenuIncome(incomeCountyMap, incomeComparisonMap, incomeColumnNames);
                 // console.log(raceComparisonMap.get(raceSelectedComparison))
                 dispatch.updateGraphIncome(incomeCountyMap.get(selectedCounty), incomeComparisonMap.get(ageSelectedComparison), incomeColumnNames);
            });
        });
    });
});

// Add listener for "loadMenuRace" event
dispatch.on("loadMenuIncome.incomeCompareMenu", function(incomeCountyMap, incomeComparisonMap, incomeColumnNames) {
    // Draw the drop-down menu for selecting a comparison data
    var select = d3.select("#income_menu")
        .append("div")
        .append("select")
		.style("width", "150px")
        .on("change", function() { // Add listener for when menu changes
            incomeSelectedComparison = this.value;
            dispatch.updateGraphIncome(incomeCountyMap.get(selectedCounty),
                incomeComparisonMap.get(incomeSelectedComparison),
                incomeColumnNames);
        });

    // Populate menu with options
    select.selectAll("option")
        .data(incomeComparisonMap.keys())
        .enter()
        .append("option")
        .attr("value", function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        });

    // Add listener for "updateGraphs" event
    dispatch.on("updateGraphIncome.comparemenu", function(selectedCountyData, selectedComparisonData, incomeColumnNames) {

        select.property("value", incomeSelectedComparison);
    });

      // console.log("compare HI"+ raceColumnNames)
});


dispatch.on("updateGraphIncome.incomepie", function(selectedCountyData, selectedComparisonData, incomeColumnNames) {

   var  width = 300- margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
    var radius = Math.min(width, height) / 2;
    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelArc = d3.svg.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { //console.log (d.value);
         return d.value; });

    // var pieChartData = selectedComparisonData.concat(selectedCountyData);

    // console.log(selectedCountyData.columns)
    d3.select("#income_pie svg").remove();
    var svg = d3.select("#income_pie").append("svg")
        .attr("width", width+200)
        .attr("height", height)
      .append("g")
     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var g = svg.selectAll(".arc")
          .data(pie(selectedCountyData.columns))
          .enter().append("g")
          .attr("class", "arc")
          .on("mouseover", function (d) {
                d3.select(this).attr("stroke", "blue").attr("stroke-width", 0.8);
                        // console.log(d)
                d3.select("#tab_tooltip")
                    .style("left", d3.event.pageX  + "px")
                    .style("top", d3.event.pageY + "px")
                    .style("opacity", 1)
                    .select("#value")
                    .text( selectedCounty+ " " + d.data.name +": " + d.value);    
                })

                .on("mouseout", function () {
                // Hide the tooltip
                    d3.select("#tab_tooltip")
                        .style("opacity", 0);
                    d3.select(this).attr("stroke", "black").attr("stroke-width", 0.2);
            });

        
      g.append("path")
          .attr("d", arc)
          .style("fill", function(d) { return color(d.data.name); });

      g.append("text")
          .attr("text-anchor", "middle")  
          .attr("transform", function(d) {// console.log(labelArc.centroid(d));
           return "translate(" + labelArc.centroid(d) + ")"; })
          .attr("dy", ".55em")
          .text(function(d) { //console.log(d,d.data.name) ;
                return d.data.value + "%"; })
          .style("font-size", "14px");
		  
		//legend
        var legend = svg.selectAll(".legend")
            .data(incomeColumnNames.slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(20," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", width)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 15)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .text(function(d) {
                return d;
            });


        d3.select("#income_state_pie svg").remove();
        var State_svg = d3.select("#income_state_pie").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var state_g = State_svg.selectAll(".arc")
          .data(pie(selectedComparisonData[0].columns))
          .enter().append("g")
          .attr("class", "arc")
          .on("mouseover", function (d) {
                d3.select(this).attr("stroke", "blue").attr("stroke-width", 0.8);
                        // console.log(d)
                d3.select("#tab_tooltip")
                    .style("left", d3.event.pageX  + "px")
                    .style("top", d3.event.pageY + "px")
                    .style("opacity", 1)
                    .select("#value")
                    .text("State " + d.data.name +": " + d.value);
                })

                .on("mouseout", function () {
                // Hide the tooltip
                    d3.select("#tab_tooltip")
                        .style("opacity", 0);
                    d3.select(this).attr("stroke", "black").attr("stroke-width", 0.2);
            });

      state_g.append("path")
          .attr("d", arc)
          .style("fill", function(d) { return color(d.data.name); });

      state_g.append("text")
          .attr("text-anchor", "middle") 
          .attr("transform", function(d) {// console.log(labelArc.centroid(d));
           return "translate(" + labelArc.centroid(d) + ")"; })
          .attr("dy", ".55em")
          .text(function(d) { //console.log(d,d.data.value) ;
            return d.data.value + "%"; })
          .style("font-size", "14px");
         
         
})




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

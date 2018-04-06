var tradable_stock_info = d3.csv('/static/data/Robinhood_tradable.csv')
console.log(tradable_stock_info)

    
d3.csv('/static/data/Robinhood_tradable.csv', function(csv_data){
        
	var nested_data = d3.nest()
	    .key(function(d) { return d.sector; })
	    .rollup(function(leaves) {return leaves.length})
	    .entries(csv_data);
		//alert(JSON.stringify(nested_data));

	// Define the div for the tooltip
	var div = d3.select("body").append("div")	
	    .attr("class", "tooltip")				
	    .style("opacity", 0);

	//Plot the barchart
	var svgWidth = 800;
	var svgHeight = 500;
	 

	var heightPad = 200;
    var widthPad = 50;

	var svg = d3.select("#sectorChart")
	.append("svg")
	.attr("width", svgWidth + (widthPad * 2))
	.attr("height", svgHeight + (heightPad * 2))
	.append("g")
    .attr("transform", "translate(" + widthPad + "," + heightPad + ")");;

	var xScale = d3.scale.ordinal()
    .domain(nested_data.map(function(d) { return d.key; }))
    .rangeRoundBands([0, svgWidth], .1)

    var yScale = d3.scale.linear()
	.domain([0, 1200])
	.range([svgHeight,0]);

	var yAxis = d3.svg.axis()
	    .scale(yScale)
	    .orient("left");
	     
	svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(" + widthPad + ",0)")
	    .call(yAxis)
	    .append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -50)
		.attr("x", -150)
		.style("text-anchor", "end")
		.text("Number of stocks");;

	var xAxis = d3.svg.axis()
	    .scale(xScale)
	    .orient("bottom");
	 
	svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(" + widthPad + "," + svgHeight + ")")
	    .call(xAxis)
		.selectAll("text")	
		.attr("x", 0 - 2*widthPad)
		.attr("y", 5)
        .attr("transform", "rotate(-65)")

     

	svg.selectAll("rect")
	    .data(nested_data)
	    .enter().append("rect")
	    .on("mouseover", function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div	.html(d.key + "<br/>"  + d.values)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })	
	    .attr("x", function (d) { return xScale(d.key) + widthPad; })
	    .attr("y", function (d) { return yScale(d.values); })
	    .attr("height", function (d) { return svgHeight - yScale(d.values); })
	    .attr("width", xScale.rangeBand())
	    .attr("fill", "red");



});





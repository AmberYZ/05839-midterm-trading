//Scattor Plots
var margin = {top: 20, right: 20, bottom: 30, left: 60},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

// setup x 

var xValue = function(d) { return d.ave_high_low;}, // data -> value
    xScale = d3.scale.linear().range([0, width]).nice(), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d.ave_volume;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]).nice(), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

    var xCat = 'ave_high_low',
    yCat = 'ave_volume';
// setup fill color
var cValue = function(d) { return d.sector;},

color = d3.scale.category20();


// add the graph canvas to the body of the webpage
var svg = d3.select("#priceVolumeChart")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
.attr("class", "tooltip-large")
.style("opacity", 0);

// load data
d3.csv("/static/data/year_price_volume.csv", function(error, data) {
  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);


  //Filter out n/a sector
  data = data.filter(function(row) {
    return row['sector'] != 'n/a';
})


  //Only save two decimal places
  data.forEach(function(d) {
    d["ave_volume"] = +d["ave_volume"]
    d["ave_high_low"] = +d["ave_high_low"]
    d["ave_open_close"] = +d["ave_open_close"]
    d["ave_change_up"] = +d["ave_change_up"] 
    d["ave_change_down"] = +d["ave_change_down"]
    d['last_price'] = +d['last_price']

    d["ave_volume"]=  parseFloat(d["ave_volume"]).toFixed(2)
    d["ave_high_low"]=  parseFloat(d["ave_high_low"]).toFixed(2)
    d["ave_open_close"] = parseFloat(d["ave_open_close"]).toFixed(2)
    d["ave_change_up"] = parseFloat(d["ave_change_up"]).toFixed(2)
    d["ave_change_down"] = parseFloat(d["ave_change_down"]).toFixed(2)
});


  // x-axis
  svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
  .append("text")
  .attr("class", "label")
  .attr("x", width)
  .attr("y", -6)
  .style("text-anchor", "end")
  .text("Average daily price change");

  // y-axis
  svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("class", "label")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Average Volume");

  var objects = svg.append("svg")
  .classed("objects", true)
  .attr("width", width)
  .attr("height", height);


  objects.append("svg:line")
  .classed("axisLine hAxisLine", true)
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", width)
  .attr("y2", 0)
  .attr("transform", "translate(0," + height + ")");

  objects.append("svg:line")
  .classed("axisLine vAxisLine", true)
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", 0)
  .attr("y2", height);


  // draw dots
  objects.selectAll(".dot")
  .data(data)
  .enter().append("circle")
  .attr("class", "dot")
  .attr("r", 3.5)
  .attr("cx", xMap)
  .attr("cy", yMap)
  .attr("r", function(data) { 
    scaled_down = data.last_price / 10;
    return scaled_down;
    if (scaled_down > 10) {
        return 10;
    }else{
        return scaled_down;
    }
})
  .style("fill", function(d) { return color(cValue(d));}) 
  .style("opacity",0.2)
  .on("mouseover", function(d) {
      tooltip.transition()
      .duration(200)
      .style("opacity", .9);
      tooltip.html(d["symbol"] + "<br/> Average Daily price change (%): " + xValue(d) 
        + "<br/> Average Trading Volume: " + yValue(d)
        +" <br/> Average Open/Close Price change (%): "+d.ave_open_close
        +"<br/> Average Change Up (%): "+d.ave_change_up
        +"<br/> Average Change Down (%): "+d.ave_change_down
        +"<br/> Last quote price: "+d.last_price)
      .style("left", (d3.event.pageX + 5) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
  })
  .on("mouseout", function(d) {
      tooltip.transition()
      .duration(50)
      .style("opacity", 0);
  })
  .transition().duration(1000);

  ///legend
  svg.selectAll(".legend").data(data)

  var legend = svg.selectAll(".legend")
  .data(color.domain())
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // Clickable legend for filtering
  var clicked = ""
  //Initialize the clicked toggles for each sector
  var active = {}
  data.forEach(function(d) {
    var key = d['sector'];
    active[key] = true;
});


  legend.append("rect")
  .attr("x", width - 18)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", color)
  .on("click",function(d){

    if (active[d] == true){
        active[d] = false;
        d3.selectAll(".dot").filter(function(e){
            return e.sector == d;
        })
        .style("opacity",1)
    }else{
        active[d] = true;
        d3.selectAll(".dot").filter(function(e){
            return e.sector == d;
        })
        .style("opacity",0.02)

    }    
});

  //Legend text
  legend.append("text")
  .attr("x", width - 24)
  .attr("y", 9)
  .attr("dy", ".35em")
  .style("text-anchor", "end")
  .text(function(d) { return d; });


/* Filter stocks based on the maximum quote price */
//Set the upper limit to the maximum price in the dataset
var upperLimit = d3.max(data, function(d) { return d.last_price; });
document.getElementById("quotePriceSlider").max = upperLimit;
var priceLimit = 100; //Default price limit $100
d3.select("output#quotePrice").text(d3.format(".2f")(priceLimit));

d3.selectAll(".dot").filter(function(e){
    return e.last_price > priceLimit;
})
.style("visibility","hidden");

//Update on input
d3.select("input[type=range]#quotePriceSlider").on("input", function() {
  priceLimit = this.value;
  d3.select("output#quotePrice").text(d3.format(".2f")(priceLimit));

  d3.selectAll(".dot").filter(function(e){
    return e.last_price > priceLimit;
})
  .style("visibility","hidden")
  .transition().duration(10000);

  d3.selectAll(".dot").filter(function(e){
    return e.last_price <= priceLimit;
})
  .style("visibility","visible")
  .transition().duration(10000);

});



});   





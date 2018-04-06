// var ticker = 'AAPL' //Default ticker
var year_data_path = '/static/data/past_year/'
var year_week_path = '/static/data/last_week/'


function getTicker(){
	ticker =  document.getElementById('inputSymbol').value.toUpperCase();
	loadSelectedStockCustomize(year_data_path, 'priceTimeSeries','averageReturnYear', 20,50)
	loadSelectedStockCustomize(year_week_path,'shortTermSeries', 'shortTermAverageReturnYear',5,10)

}

function rePlot(){
	var ma1_interval = parseInt(document.getElementById('inputMa1').value)
	var ma2_interval = parseInt(document.getElementById('inputMa2').value)
	loadSelectedStockCustomize(year_data_path,'priceTimeSeries','averageReturnYear',  ma1_interval,ma2_interval)
}

function rePlotShortTerm(){
	var ma1_interval = parseInt(document.getElementById('shortTermInputMa1').value)
	var ma2_interval = parseInt(document.getElementById('shortTermInputMa2').value)
	loadSelectedStockCustomize(year_week_path,'shortTermSeries', 'shortTermAverageReturnYear', ma1_interval,ma2_interval)
}


function loadSelectedStockCustomize(data_path, plotId, output, interval_1,interval_2) {

    //First plot: historicals
    d3.json(data_path+ticker+".json", function(error, data){
    	historicals = (data[0]['historicals']);
    	//console.log(historicals)
    	var time = []
    	var price = []
    	var high_price = []
    	var open_price= []
    	var low_price = []

    	//Plot the time series of the closing price 
    	historicals.forEach(function(obj){
    		price.push(obj.close_price)
    		time.push(obj.begins_at)
    		high_price.push(obj.high_price)
    		low_price.push(obj.low_price)
    		open_price.push(obj.open_price)
    	});


    	//Serie 1: closing price
    	var price_serie = {
    		type: "scatter",
    		mode: "lines",
    		x: time,
    		y: price,
    		line: {color: '#17BECF'},
    		name: "Closing Price"
    	}



    	//Serie 2:  moving average 1

    	for(var i=0; i<price.length;i++) price[i] = +price[i];
    		moving_average_a = movingAvg(price, interval_1,function(val){ return val != 0; });

    	//console.log(moving_average_a)
    	var ma1 = {
    		type: "scatter",
    		mode: "lines",
    		name: "MA "+interval_1,
    		x: time,
    		y: moving_average_a,
    		line: {color: '#404040'},
    	}


    	//Serie 3: moving average 2
    	moving_average_b = movingAvg(price, interval_2,function(val){ return val != 0; });

    	var ma2 = {
    		type: "scatter",
    		mode: "lines",
    		name: "MA "+interval_2,
    		x: time,
    		y: moving_average_b,
    		line: {color: '#ff5000'},
    	}

    	//Serie 4: chandlestick
    	var candle = {
    		type: 'candlestick',
    		x: time,
    		decreasing: {line: {color: '#fc0352'}}, 
    		increasing: {line: {color: '#009900'}}, 
    		name: "candle",
    		high: high_price,
    		low: low_price,
    		open: open_price,
    		close: price,

    	}

    	var data = [price_serie , ma1, ma2, candle];
    	var layout = {
    		title: 'Time Series info for '+ticker,
    		showlegend: true, 

    	};

    	Plotly.newPlot(plotId, data, layout);


    	//Now, regress the strategy
	    //Find the buying and selling point
	    //moving_a = short term
	    //moving_b = long term
	    //Take long: short term cross over long term
	    //Take short: long term cross over short 
	    buffer = 3

	    long_time = []
	    long_price = []
	    short_time = []
	    short_price = []

	    inital = false;
	    crossover = false;

	    for (var i=0; i < moving_average_a.length; i++){
	    	if (moving_average_a[i] == null || moving_average_b[i] == null){
	    		continue;
	    	}

	    	//Get rid of the beginning
	    	if (moving_average_a[i] <= moving_average_b[i]){
	    		inital = true
	    	}
	    	if (inital == false){
	    		continue;
	    	}
    		//Signal the crossover point: long at the current market price
    		if (moving_average_a[i] >= moving_average_b[i] && crossover == false) {
    			long_time.push(time[i])
    			long_price.push(price[i])
    			crossover = true
    			
    		}
    		//Signal the exit point: short at the current market price
    		if (moving_average_a[i] < moving_average_b[i] && crossover == true){
    			short_time.push(time[i])
    			short_price.push(price[i])
    			crossover = false;
    		}

    	}
    	// console.log(long_time)
    	// console.log(long_price)
    	// console.log(short_time)
    	// console.log(short_price)
	    
	    //Now regress the strategy to get average return rate
	    return_rate = []
	    if (long_price.length > 0){
	    	for (var i=0; i<long_price.length; i++){
	    		if (i < short_price.length){
	    			cur_return = (short_price[i] - long_price[i])/long_price[i]
	    			return_rate.push(cur_return)
	    		}

	    	}
	    	// console.log(return_rate)
	    }
	    var total = 0;
		for(var i = 0; i < return_rate.length; i++) {
		    total += return_rate[i];
		}
		var avg_return_rate = (total / return_rate.length)*100;

		console.log(avg_return_rate)
		d3.select('#'+output).text(d3.format(".2f")(avg_return_rate))
		

	});




}



function movingAvg(array, count, qualifier){
// calculate average for subarray
var avg = function(array, qualifier){
	var sum = 0, count = 0, val;
	for (var i in array){
		val = array[i];
		if (!qualifier || qualifier(val)){
			sum += val;
			count++;
		}
	}
	return sum / count;
};
var result = [], val;
// pad beginning of result with null values
for (var i=0; i < count-1; i++)
	result.push(null);
// calculate average for each subarray and add to result
for (var i=0, len=array.length - count; i <= len; i++){
	val = avg(array.slice(i, i + count), qualifier);
	if (isNaN(val))
		result.push(null);
	else
		result.push(val);
}

return result;
}
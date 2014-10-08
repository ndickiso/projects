$( document ).ready(function() {
	
	
	//----GLOBALS----//
	var timeFrame,apiTrack,testApiTrack,resetInterval;
	
	
	//#### ARRAY AVERAGE PROTOTYPE ####//
	Array.prototype.average=function(){
	    var sum=0;
	    var j=0;
	    for(var i=0;i<this.length;i++){
	        if(isFinite(this[i])){
	          sum=sum+parseFloat(this[i]);
	           j++;
	        }
	    }
	    if(j===0){
	        return 0;
	    }else{
	        return (sum/j).toFixed(2);
	    }
	}
	
	//----Init the api to the current View Timeframe settings----//
	timeFrame = "latest";
	apiTrack = "http://107.170.78.197/apiTrack/"+timeFrame;
	testApiTrack = "http://127.0.0.1:8080/apiTrack/"+timeFrame;

	
	//#### BIND CLICK TO SET TRACK API TIMEFRAME, AND CALL API WITH NEW CURRENT DATA >>
	$(".timeframe a").bind("click",function(event){ 
		
		var target;
		
		event.preventDefault();  
		target = $(this).attr("href");
		
		timeFrame=target;
		
		apiTrack = "http://107.170.78.197/apiTrack/"+timeFrame;
	    testApiTrack = "http://127.0.0.1:8080/apiTrack/"+timeFrame;
	    
	    getApiTrack();
		
	});
	
	
	
	//#### CHART.JS- CREATE, CUSTOMIZE, APPEND GRAPHS ####//
	function graphIt(timeD,motionD,objmoveD,tempD,lightD){
		
		var tlCanvas= document.getElementById("temp-light");
		var tlCtx = tlCanvas.getContext("2d");
		
		var mmCanvas= document.getElementById("motion-movement");
		var mmCtx = mmCanvas.getContext("2d");
		
		
		var tlChartData = {
		labels: timeD,
		datasets: [
					{
						fillColor:'rgba(231,230,97,.5)',
						strokeColor:'#B56719',
						pointColor:'rgba(255,255,255,.8)',
						pointStroke:'#B56719',
						data: lightD	
					},
					{
						fillColor:'rgba(231,23,97,.5)',
						strokeColor:'#B56719',
						pointColor:'rgba(255,255,255,.8)',
						pointStroke:'#B56719',
						data: tempD	
					}
				  ]
		}
		
		var mmChartData = {
		labels: timeD,
		datasets: [
					{
						fillColor:'rgba(231,230,97,.8)',
						strokeColor:'#B56719',
						pointColor:'rgba(255,255,255,.8)',
						pointStroke:'#B56719',
						data: motionD	
					},
					{
						fillColor:'rgba(231,23,97,.8)',
						strokeColor:'#B56719',
						pointColor:'rgba(255,255,255,.8)',
						pointStroke:'#B56719',
						data: objmoveD	
					}
					
				  ]
		}

		
		//----Set and Append averages here----//
		$("#averages").empty();
		$("#averages").append($("<p><b>Temp:</b> "+tempD.average()+"&deg; <b>Light:</b> "+lightD.average()+" <b>Motion:</b> "+motionD.average()+" <b>Object Moved:</b> "+objmoveD.average()+"</p>"));
		
		
		//----Set and Append Alerts here----//
		if(motionD.average() > 10){
			$("#alerts").empty();
			$("#alerts").append($("<p class='alert'>There is an unusual amount of motion!</p>"));
		}
		else{
			$("#alerts").empty();
			$("#alerts").append($("<p class='alert'>Everything Looks OK!</p>"));
		}
		
		
		//----Set Chart.js Options for temp & light graph----// 
		var tlOptions={
			bezierCurve: false,
			scaleFontColor : "#ffffff",
			animation: false,
			pointDotRadius : 2
			//onAnimationComplete: done //give a function to run on complete
		}
		
		//----Set Chart.js Options for motion & object movement graph----//
		var mmOptions={
			bezierCurve: false,
			scaleFontColor : "#ffffff",
			animation: false,
			pointDotRadius : 2
			//onAnimationComplete: done //give a function to run on complete
		}
		
		
		//----Init Charts with data and options----//
		var chart1 = new Chart(tlCtx).Line(tlChartData, tlOptions); //pass in otehr options here through referenced variable
		var chart2 = new Chart(mmCtx).Line(mmChartData, mmOptions); //pass in otehr options here through referenced variable

	}
	
	
	//#### SET DATA FROM API, APPEND, FORMAT, AND CALL GRAPHIT FUNCTION >> 
	function setIt(data){
		
		var timeData = [];
		var motionData = [];
		var objmoveData = [];
		var tempData = [];
		var lightData = [];
		
		for(var i=0;i<data.track.length;i++){
			
			timeData.push(data.track[i].time);
			motionData.push(data.track[i].motion);
			objmoveData.push(data.track[i].objmove);
			tempData.push(data.track[i].temp);
			lightData.push(data.track[i].light); 	
		};
		
		timeData.reverse();
		motionData.reverse();
		objmoveData.reverse();
		tempData.reverse();
		lightData.reverse();
		
		graphIt(timeData,motionData,objmoveData,tempData,lightData);
		
	}
	
	//#### GET API DATA AND CALL SET FUNCTION >> 
	function getApiTrack(){
		
		$.ajax({
			url: testApiTrack,
			dataType: "json",
			type: "GET",
			success: function(data){
				
				setIt(data);
			},
			error: function(xhr){
				console.log(xhr.responseText);
			}
		
		});	
		
	}
	
	//----Init first Api Call----//
	getApiTrack();
	
	//#### APPEND INTERVAL CLICK ####//
	$('#on').on('click',function(event){
		startInterval();
		event.preventDefault();
	})
	
	$('#off').on('click',function(event){
		clearInterval(resetInterval);
		event.preventDefault();
	})  
	
	
	//#### START INTERVAL TO AUTO UPDATE DATA ####//
	function startInterval(){
		resetInterval = setInterval(function(){ getApiTrack(); }, 10000);
	}
	
	
});
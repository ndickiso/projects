<!DOCTYPE html>
<html lang="en">
	<head>
	<title>Monitor | Arduino App</title>

	<link href="public/css/bootstrap.min.css" rel="stylesheet">
	<link href="public/css/style.css" rel="stylesheet">
	
	<script src="public/js/jquery-1.11.0.min.js"></script>
	<script src="public/js/chart.js"></script>
	<script src="public/js/ob-main.js"></script>
	
	<meta name="viewport" content="width=device-width, initial-scale=1">

	</head>
	<body>
		<div class="container">
			<div class="row">
				<div class="col-md-1">
						<img src="public/img/logo.png" width="100" />
				</div>
				<div class="col-md-6">
					<h4>Monitor Arduino App | <a href="/action/sound">Sound</a> | <a href="/action/light">Light</a> | <a href="/action/move">Move</a></h4>
					<h5>Auto Update <a id="on" href="#">ON</a> | <a id="off" href="#">OFF</a></h5>
				</div>
				<div class="timeframe col-md-5">
					<h4 class="pull-right">View Last <a href="minutes">4 Minutes</a> | <a href="hours">4 Hours</a> | <a href="day">Day</a></h4>
				</div>
			</div>
				<div class="row">
					
						<div class="col-md-6">
							<h3>Alerts</h3>
							 <div id="alerts"></div>
						</div>
						<div class="col-md-6">
							<h3>Averages</h3>
							<div id="averages"></div>
						</div>
					
				</div>
				<div class="row">	
					<div class="col-md-6">
						<div id="tl-title">
							<h1>Temp & Light</h1>
							<p><span id='lightLegend'></span>Light<span id='tempLegend'></span>Temp</p>
							<div class="col-md-6"></div>
						</div>
						 <canvas id="temp-light" height="450" width="600">Your Browser Does Not Support Canvas Elements</canvas>
					</div>
					<div class="col-md-6">
						<div id="mm-title">
							<h1>Motion & Movement</h1>
							<p><span id='motionLegend'></span>Motion<span id='objmoveLegend'></span>Object Movement</p>
							<div class="col-md-6"></div>
						</div>
						 <canvas id="motion-movement" height="450" width="600">Your Browser Does Not Support Canvas Elements</canvas>
					</div>
			   </div>
			</div>
	</body>
</html>
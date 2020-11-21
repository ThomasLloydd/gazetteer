<?php

	$executionStartTime = microtime(true) / 1000;

	/*
	$exchangeUrl = "https://openexchangerates.org/api/latest.json?app_id=16b67d24c65a4339b2acd989e854b2ee";
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$exchangeUrl);
	
	$exchangeRates=curl_exec($ch);
	
	curl_close($ch);
	
	$decodedExchange = json_decode($exchangeRates,true);

	$exchangeRate = null;
	
	foreach($decodedExchange['rates'] as $key=>$value)
		if ($key == $_REQUEST['currency'])
		$exchangeRate = $value;
	
*/
//Weather at capital data
	$weatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=" . $_REQUEST['countryCapital'] . "&units=metric&appid=701b0212cde4f325ad6738be58109033";
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$weatherUrl);
	
	$cityWeather=curl_exec($ch);
	
	curl_close($ch);
	
	$decodedWeather = json_decode($cityWeather,true);
	
	//Sunrise/Sunset
	$timezoneUrl = "http://api.geonames.org/timezoneJSON?formatted=true&lat=" . $_REQUEST['lat'] . "&lng=" . $_REQUEST['lng'] . "&username=thomaslloydd&style=full";
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$timezoneUrl);
	
	$timezone=curl_exec($ch);
	
	curl_close($ch);
	
    $decodedTimezone = json_decode($timezone,true);


    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['weatherCoords'] = $decodedWeather['coord'];
	$output['name'] = $decodedWeather['name'];
	$output['main'] = $decodedWeather['main'];
	//$output['rate'] = $exchangeRate;
	$output['timezone'] = $decodedTimezone;

    
    
    header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output)
?>



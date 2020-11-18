<?php

	$executionStartTime = microtime(true) / 1000;
	 
	

	//airport
	$weatherStationUrl = "http://api.geonames.org/weatherJSON?north=" . $_REQUEST['north'] . '&south='. $_REQUEST['south'] . "&east=" . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] . "&username=thomaslloydd";
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$weatherStationUrl);

	$weatherStationResult=curl_exec($ch);

	curl_close($ch);

	$decodedweatherStation = json_decode($weatherStationResult,true);

	//Earthquake Map
	$earthquakeUrl = "http://api.geonames.org/earthquakesJSON?north=" . $_REQUEST['north'] . '&south='. $_REQUEST['south'] . "&east=" . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] . "&username=thomaslloydd";
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$earthquakeUrl);

	$earthquakeResult=curl_exec($ch);

	curl_close($ch);

	$decodedEarthquakes = json_decode($earthquakeResult,true);


	//Earthquake Map
	$earthquakeUrl = "http://api.geonames.org/earthquakesJSON?north=" . $_REQUEST['north'] . '&south='. $_REQUEST['south'] . "&east=" . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] . "&username=thomaslloydd";
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$earthquakeUrl);

	$earthquakeResult=curl_exec($ch);

	curl_close($ch);

	$decodedEarthquakes = json_decode($earthquakeResult,true);
	

	//Wiki Bounding Box
	$wikiUrl = 'http://api.geonames.org/wikipediaBoundingBoxJSON?formatted=true&north=' . $_REQUEST['north'] . '&south='. $_REQUEST['south'] . "&east=" . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] . '&username=thomaslloydd&style=full';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$wikiUrl);

	$wikiResult=curl_exec($ch);

	curl_close($ch);

	$decodedWiki = json_decode($wikiResult,true);
	


	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['WikiBox'] = $decodedWiki['geonames'];
	$output['Earthquakes'] = $decodedEarthquakes;
	$output['wStation'] = $decodedweatherStation;

	
	
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>


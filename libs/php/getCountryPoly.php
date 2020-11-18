<?php

	$executionStartTime = microtime(true) / 1000;
	//borders
	$geoJsonBorders='../json/countryBorders.geo.json';

	$result = file_get_contents($geoJsonBorders);


	$decode = json_decode($result,true);	

	$border = null;

	$countryFeatures = [];

	foreach($decode['features'] as $feature)
		if ($feature['properties']['iso_a2'] == $_REQUEST['iso2'])
			$border = $feature['geometry'];

	$data = asort($decode['features']);

	foreach($decode['features'] as $featureCode)
	array_push($countryFeatures, [[$featureCode['properties']['name']], [$featureCode['properties']['iso_a2']]]);

	


	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['border'] = $border;
	$output['countryFeatures'] = $countryFeatures;
	
	
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>


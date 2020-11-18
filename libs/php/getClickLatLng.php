<?php

	$executionStartTime = microtime(true) / 1000;



	//Rest Countries
	$clickUrl = "https://api.opencagedata.com/geocode/v1/json?q=" . $_REQUEST['latitude'] . "+" . $_REQUEST['longitude'] . "&key=0754294f8b9e488ea0ea3f1ef4d878fb";
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$clickUrl);

	$clickResult=curl_exec($ch);

	curl_close($ch);

	$decodedClick = json_decode($clickResult,true);

	


	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['clickData'] = $decodedClick['results'];
	$output['clickCode'] = $decodedClick['results'][0]['components']['country_code'];


	
	
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>


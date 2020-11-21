<?php

	$executionStartTime = microtime(true) / 1000;

    $url = "https://api.wheretheiss.at/v1/satellites/25544";
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);
	
	$iss=curl_exec($ch);
	
	curl_close($ch);
	
    $decodedISS = json_decode($iss,true);


    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['ISS'] = $decodedISS;

    
    
    header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output)
?>
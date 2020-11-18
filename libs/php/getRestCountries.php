<?php

	$executionStartTime = microtime(true) / 1000;
//rest countries
$restCountriesUrl = "https://restcountries.eu/rest/v2/alpha/" . $_REQUEST['iso2'];
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$restCountriesUrl);

	$rcountriesResult=curl_exec($ch);

	curl_close($ch);

    $decodedRestCountries = json_decode($rcountriesResult,true);



    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['restCountries'] = $decodedRestCountries;
    $output['name'] = $decodedRestCountries['name'];
    $output['countryCode'] = $decodedRestCountries['alpha2Code'];
    $output['capital'] = $decodedRestCountries['capital'];
    $output['population'] = $decodedRestCountries['population'];
    $output['region'] = $decodedRestCountries['region'];
    $output['flag'] = $decodedRestCountries['flag'];
    $output['currency'] = $decodedRestCountries['currencies'][0]['code'];


    header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output)
    
    ?>
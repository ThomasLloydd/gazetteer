<?php

$executionStartTime = microtime(true) / 1000;

//cities/places
$placesUrl = "http://api.geonames.org/citiesJSON?north=" . $_REQUEST['north'] . '&south=' . $_REQUEST['south'] . "&east=" . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] . "&lang=en&username=thomaslloydd";
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $placesUrl);

$placesResult = curl_exec($ch);

curl_close($ch);

$decodedPlaces = json_decode($placesResult, true);

$decodedPlace = null;

if ($decodedPlaces != null)
    $decodedPlace = $decodedPlaces;


$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['places'] = $decodedPlaces;




header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);



?>
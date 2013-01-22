<?php
//****************************************
// 
// PLACES/HANDLER_UPDATEEDITS.PHP
//
//****************************************
// ----------------
// DATABASE INIT
// ----------------
include 'connect_db.php';


// ----------------
// RETRIEVE FORM DATA
// ----------------
$id = $_POST["id"];
$name = $_POST["name"];
$street = $_POST["street"];
$city = $_POST["city"];
$state = $_POST["state"];
$country = $_POST["country"];
$lat = $_POST["latitude"];
$lng = $_POST["longitude"];
$category = $_POST["category"];

// ----------------
// VALIDATE DATA
// ----------------
// prevent SQL Injection Attacks 
// check name/street/city/state is not an invalid string
// if number field, check that input is actually a number
if (!is_numeric($lat)) {

}
if (!is_numeric($lng)) {

}
// check category

// (a single apostrophe closes the opening quote closes initial SQL statement)
// (any odd number of apostrophes would be transformed to an even number)
$data = array($name, $street, $city, $state, $country, $lat, $lng, $category, $id);
foreach ($data as &$value) {
	$value = str_replace("'", "''", $value);
}

// ----------------
// INSERT FORM DATA
// ----------------
$q = "UPDATE places SET Name=?, Street=?, City=?, State=?, Country=?, Lat=?, Lng=?, Category=? WHERE id=?";
$q = $pdo->prepare($q);
$q->execute($data);

// ----------------
// RETRIEVE FORM DATA
// ----------------
/*

$lat = $_POST["lat"];
$lng = $_POST["lng"];

$data = array($lat, $lng, $id);


$q = $pdo->prepare($q);
$q->execute($data);

*/

// ----------------
// DATABASE CLOSE
// ----------------
$pdo = null;
?>
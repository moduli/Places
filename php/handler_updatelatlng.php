<?php
//****************************************
// 
// PLACES/HANDLER_UPDATELATLNG.PHP
//
//****************************************
// ----------------
// DATABASE INIT
// ----------------
include 'connect_db.php';

// ----------------
// RETRIEVE FORM DATA
// ----------------
// get data from 
$id = $_POST["id"];
$lat = $_POST["lat"];
$lng = $_POST["lng"];

// store in an array
$data = array($lat, $lng, $id);


// ----------------
// VALIDATE DATA
// ----------------
// prevent SQL Injection Attacks 
// if number field, check that input is actually a number
if (!is_numeric($lat)) {

}
if (!is_numeric($lng)) {

}

// ----------------
// INSERT FORM DATA
// ----------------
// send to database
$q = "UPDATE places SET Lat=?, Lng=? WHERE id=?";
$q = $pdo->prepare($q);
$q->execute($data);

// ----------------
// DATABASE CLOSE
// ----------------
$pdo = null;
?>
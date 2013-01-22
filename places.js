//****************************************
// 
// places.js
//
//****************************************
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//****************************************
// VARIABLES 
//****************************************
var keys;					// titles of database

var map,					// reference to google map
	geocoder,				// reference to google geocoder	
	table,					// reference to HTML table
	markers = [],			// reference to all markers
	active_marker = null;	// reference to active marker (user selected)

var add_mode = false,		// flag: if adding a new location
	edit_mode = false;		// flag: if editing existing locations
	


//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//****************************************
// MAP FUNCTIONS
//****************************************
// ---------------------------
//
// initializeMap
// create map instance
//
// ---------------------------
function initializeMap() {
	// create map
	var mapOptions = {
          center: new google.maps.LatLng(20, 0),
          zoom: 2,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    // create geocoder
    geocoder = new google.maps.Geocoder();
}
function initMapEvents() {
	// if user clicks map, close any open 
    google.maps.event.addListener(map, 'click', function(event) {
    	if (active_marker) {
    		$("#info_div").css({'display':'none'});
    		$("#editbuttonli").css({'display':'none'});

    		// clear active marker
    		active_marker = null;
    	}
    });
   	// if user clicks marker, show information
    $.each(markers, function(i) {
		setMarkerEvent(markers[i]);
    });
}
function setMarkerEvent(marker) {
	google.maps.event.addListener(marker, 'click', function(event) {
		// set this marker as active
		active_marker = this;
			// !! change icon to show it is active

		// add information to info_div
		$("#info_div form").empty();
		$("#info_div #edit_form").append("<ul></ul>");
		$.each(keys, function(j) {
			$("#info_div #edit_form ul").append("<li>"+keys[j]+":  <span class='data'>"+ marker._data[keys[j]]+"</span></li>");
		});

		// show info_div 
		$("#info_div").css({'display':'block'});
		$("#editbuttonli").css({'display':'list-item'});
	});
}

// ---------------------------
//
// populateMap
// add data to map
//
// ---------------------------
function populateMap(places) {
    for (var i in places) {
		// if place does not have lat/lng, geocode
		if (!places[i].Lat && !places[i].Lng) {
			var geocode_options = {
				type: "update",
				data: places[i]
			};
			var query_string = places[i].Street + ' ' + places[i].City + ', ' + places[i].State;
			geocode(query_string, geocode_options);
		}
		// else, place marker onto map
		else {	
			markers.push(placeMarker(new google.maps.LatLng(places[i].Lat, places[i].Lng), places[i]));
		}
	}
}
// ---------------------------
//
// geocode functions
// look up latlng or address
//
// ---------------------------
function geocode(query_string, options) {
	geocoder.geocode( {'address': query_string}, function(results, status) {
  		if (status == google.maps.GeocoderStatus.OK) {
  			// ====================
  			// if updating location when loading database
  			// ====================
  			if (options.type == "update") {
  				// push update to server
  				$.ajax({
			   		url: 'php/handler_updatelatlng.php',
			   		type: 'POST',
			   		data: {
			   			'id':options.data.id, 
			   			'lat':results[0].geometry.location.Ya, 
			   			'lng':results[0].geometry.location.Za
			   		},
			   		success: function(response) {
						// show update complete:
			 	 	}
				});
				placeMarker(results[0].geometry.location, options.data);
  			}
  			// ====================
  			// if user used the search box
  			// ====================
  			else if (options.type == "search") {
  				map.setCenter(results[0].geometry.location);
  				map.setZoom(16);
  			}
      	} 
      	else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {

      	}
      	else {
      		alert("Geocode was not successful for the following reason: " + status);
      	}
    });
}
function geocodeReverse(query_lat, query_lng, options) {
	var latlng = new google.maps.LatLng(query_lat, query_lng);
	geocoder.geocode({'latLng': latlng}, function(results, status) {
	  	if (status == google.maps.GeocoderStatus.OK) {
	  		// ====================
	  		// ====================
	  		if (options.type == "add") {

	  		}
	  		// ====================
	  		// ====================
	  		else if (options.type == "search") {
	  			if (results[1]) {
		        	map.setCenter(latlng);
					map.setZoom(13);
		        }
	  		}
	  	} 
	  	else {
	        alert("Geocode was not successful for the following reason: " + status);
	  	}
	});
}


// ---------------------------
//
// submitSearch
// handle user input from search box
//
// ---------------------------
function submitSearch() {
	var query_string = document.getElementById('searchbox').value;

	// check if string is latlng coordinates
	var latlngStr = query_string.split(',', 2);
	if ((latlngStr.length == 2) && isNumber(parseFloat(latlngStr[0])) && isNumber(parseFloat(latlngStr[1]))) {
		// var lat = parseFloat(latlngStr[0]);
		// var lng = parseFloat(latlngStr[1]);	
		var geocode_options = {
			type: "update"
		};
		geocodeReverse(parseFloat(latlngStr[0]), parseFloat(latlngStr[1]));
	}
	else {
		var geocode_options = {
			type: "search",
		};
		geocode(query_string, geocode_options);
	}
}

// ---------------------------
//
// placeMarker
// add marker to map
//
// ---------------------------
function placeMarker(location, data) {
	// create marker
	var marker = new google.maps.Marker({
		position: location,
		map: map
	});

	if (data) {
		// save id information to marker structure
		marker._id = data.id;
		marker._data = data;

		// show name when hovering over marker
		marker.setTitle(data.Name);
	}

	return marker;
}



//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//****************************************
// MAP ENTRY FUNCTIONS
//****************************************
// ---------------------------
//
// initData
// 
//
// ---------------------------
function initData(data) {
	titles = Object.keys(data[0]);
	titles.splice($.inArray("id", titles), 1);
	titles.splice($.inArray("Lat", titles), 1);
	titles.splice($.inArray("Lng", titles), 1);
	titles.splice($.inArray("LastModified", titles), 1);

	return titles;
}
// ---------------------------
//
// populateAddForm
//
// ---------------------------
function populateAddForm(places) {
	// populate "Categories" pull-down menu
	var categories = [];
	$.each(places, function(i) {
		categories.push(places[i].Category);
	});
	var unique = getUnique(categories);
	unique.sort();
	$("#categoryoptions").append($("<option>")
			.attr("value", "")
			.attr("disabled", "disabled")
			.attr("selected", "selected")
			.text("Select an option")
	);
	$.each(unique, function(i) {
		$("#categoryoptions").append($("<option></option>")
			.attr("value", unique[i])
			.text(unique[i]));
	});
	$("#categoryoptions").append($("<option>")
			.attr("value", "custom")
			.text("Add new category...")
	);


}

// ---------------------------
//
// toggleAddMode
//
// ---------------------------
function toggleAddMode() {
	// turn off edit mode
	if (edit_mode) {
		toggleEditMode();
	}

	// OFF
	if (add_mode) {
		add_mode = false;

		$('#addbutton').css({'color':'blue'});	
		$('#cancelbuttonli').css({'display':'none'});

		// restore events
		google.maps.event.clearListeners(map);	
		initMapEvents();

		// hide information window
		$('#info_div').css({'display':'none'});


		// if a marker was placed on the map, remove it
		if (active_marker) {
			// remove temporary marker
			active_marker.setMap(null);
			active_marker = null;

			// reset add_form
			$("#add_form")[0].reset();
			$(".input_error").remove();	// remove any error text
		}
	}
	// ON
	else {
		add_mode = true;
		$('#addbutton').css({'color':'red'});
		$('#editbuttonli').css({'display':'none'});
		$('#cancelbuttonli').css({'display':'list-item'});
		$("#info_div form").empty();
		active_marker = null;
		
		// remove other events
		google.maps.event.clearListeners(map);
		$.each(markers, function(i) {
			google.maps.event.clearListeners(markers[i]);		
		});

		// add event: when user clicks map, creates a marker that is movable
		// defines new location to add to database
		google.maps.event.addListener(map, 'click', function(event) {
			// drop a marker
			if (!active_marker) {
				active_marker = placeMarker(event.latLng);
				active_marker.setDraggable(true);	

				// show add form
				$("#info_div #add_form").append("<ul></ul>");
				$.each(keys, function(j) {
					$("#info_div #add_form ul").append("<li>"+keys[j]+":  <input type='text' name='"+keys[j]+"' autocomplete='off'></li>");
				});
				$("#info_div #add_form").append('<input type="button" value="Submit" onclick="validateForm()">');
				$("#info_div").css({'display':'block'});
			}
			// update existing marker
			else {
				active_marker.setPosition(event.latLng);
			}
		});
	}
}
// ---------------------------
//
// cancelAdd
//
// ---------------------------
function cancelMode() {
	// turn off add mode
	if (add_mode) {
		toggleAddMode();	
	}
	// turn off edit mode
	if (edit_mode) {
		toggleEditMode();
	}
}

// ---------------------------
//
// toggleEditMode
//
// ---------------------------
function toggleEditMode() {
	// turn off add mode
	if (add_mode) {
		toggleAddMode();
	}

	// turn off edit mode
	if (edit_mode) {
		edit_mode = false;

		// hide edit buttons
		$('#editbutton').css({'color':'blue'});	
		$('#addbuttonli').css({'display':'list-item'});
		$('#cancelbuttonli').css({'display':'none'});

		// return events to normal state
		google.maps.event.clearListeners(active_marker);
		initMapEvents();
		active_marker.setDraggable(false);

		// add information to info_div
		$("#info_div form").empty();
		$("#info_div #edit_form").append("<ul></ul>");
		$.each(keys, function(j) {
			$("#info_div #edit_form ul").append("<li>"+keys[j]+":  <span class='data'>"+ active_marker._data[keys[j]]+"</span></li>");
		});

		// return edited marker to position
		active_marker.setPosition(new google.maps.LatLng(active_marker._data.Lat, active_marker._data.Lng));

	}
	// turn on edit mode
	else {
		edit_mode = true;

		// show edit buttons
		$('#editbutton').css({'color':'red'});
		$('#addbuttonli').css({'display':'none'});
		$('#cancelbuttonli').css({'display':'list-item'});

		// remove other events
		google.maps.event.clearListeners(map);
		$.each(markers, function(i) {
			google.maps.event.clearListeners(markers[i]);		
		});
		
		// add event: in edit mode, marker can be modified
		active_marker.setDraggable(true);

		// track the marker that was moved and the lat/lng position it was moved to
		/*
		google.maps.event.addListener(active_marker, 'dragend', function(event) {
			changed.id = this._id;
			changed.lat = this.getPosition().lat();
			changed.lng = this.getPosition().lng();
		});
		*/
		// set info to be editable
		$("#info_div form").empty();
		$("#info_div #edit_form").append("<ul></ul>");
		$.each(keys, function(j) {
			$("#info_div #edit_form ul").append("<li>"+keys[j]+":  <input type='text' name='"+keys[j]+"' autocomplete='off' value='"+active_marker._data[keys[j]]+"'></li>");
		});
		$("#info_div #edit_form").append('<input type="button" value="Submit" onclick="validateForm()">');


	}

}

// ---------------------------
//
// validateForm
// checks user input from add_entry.php
//
// ---------------------------
//http://www.yourhtmlsource.com/javascript/formvalidation.html
function validateForm() {
	// ====================
	// data checking
	// ====================
	var current_form;
	if (add_mode)
		current_form = "add_form";
	else if (edit_mode)
		current_form = "edit_form";

	// look for input errors
	var error_flag = false;
	var name = document.forms[current_form]["Name"].value;
	if (name == null || name == "") {
		$("#input_name").append("<span class='input_error'> Required</span>");
		error_flag = true;
	}
	var street = document.forms[current_form]["Street"].value;
	if (street == null || street == "") {
		$("#input_street").append("<span class='input_error'> Required</span>");
		error_flag = true;
	}
	var city = document.forms[current_form]["City"].value;
	if (city == null || city == "") {
		$("#input_city").append("<span class='input_error'> Required</span>");
		error_flag = true;
	}
	var state = document.forms[current_form]["State"].value;
	if (state == null || state == "") {
		$("#input_state").append("<span class='input_error'> Required</span>");
		error_flag = true;
	}
	var country = document.forms[current_form]["Country"].value;
	if (country == null || country == "") {
		$("#input_country").append("<span class='input_error'> Required</span>");
		error_flag = true;
	}
	var category = document.forms[current_form]["Category"].value;
	if (category == null || category == "") {
		$("#input_category").append("<span class='input_error'> Required</span>");
		error_flag = true;
	}
	var lat, lng;
	lat = active_marker.position.Ya;
	lng = active_marker.position.Za;
	if (!isNumber(lat) || !isNumber(lng)) {

			error_flag = true;
	}

	// ====================
	// send data to database
	// ====================
	if (error_flag) {
		console.log("Error_Flag");
		return false;
	}
	// handle data
	else {
		// ADD TO DATABASE
		if (add_mode) {
			
			$.ajax({
		   		url: 'php/handler_add.php',
		   		type: 'POST',
		   		data: {
		   			'name':name,
		   			'street':street,
		   			'city':city,
		   			'state':state,
		   			'country':country,
		   			'latitude':lat, 
		   			'longitude':lng,
		   			'category':category,
		   		},
		   		success: function(id) {
					// show update complete:

					// drop marker on clicked position

					// add marker data
					active_marker._id = id;
					active_marker._data = {};
					$.each(keys, function(i) {
						active_marker._data[keys[i]] = document.forms[current_form][keys[i]].value;
					});
					active_marker._data["Lat"] = lat;
					active_marker._data["Lng"] = lng;
					setMarkerEvent(active_marker);

					active_marker = null;
					toggleAddMode();
		 	 	}
			});
		}
		// SEND EDITED CHANGES
		else if (edit_mode) {
			$.ajax({
				url: 'php/handler_updateedits.php',
				type: 'POST',
				data: {
					'id':active_marker._id,
					'name':name,
		   			'street':street,
		   			'city':city,
		   			'state':state,
		   			'country':country,
		   			'latitude':lat, 
		   			'longitude':lng,
		   			'category':category,
				},
				success: function(response) {
					// change marker data
					$.each(keys, function(i) {
						active_marker._data[keys[i]] = document.forms[current_form][keys[i]].value;
					});
					active_marker._data["Lat"] = lat;
					active_marker._data["Lng"] = lng;

					toggleEditMode();
				}
			});
		}	
	}
	
	return true;
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//****************************************
// TABLE FUNCTIONS
//****************************************
// ---------------------------
//
// initializeTable
// 
//
// ---------------------------
function initializeTable() {
	table = $('#table').append($('<table>'));
}
// ---------------------------
//
// populateTable
//
// ---------------------------
function populateTable(places) {
	// write table header
	var keys = Object.keys(places[0]),
		row = $('<tr>'),
		cell,
		cells = [];
	$.each(keys, function(i) {
		// don't display these fields
		if ((/^(?:id|Lat|Lng|People|Notes|LastModified)$/.test(keys[i]))) {
			return;
		}
		cell = $('<th>').html(keys[i]);
		cells.push(cell);
	});
	table.append(row.append(cells));

	// write table cells
	$.each(places, function(i) {
		row = $('<tr>');
		cells = [];
		$.each(places[i], function(j) {
			// don't display these fields
			if ((/^(?:id|Lat|Lng|People|Notes|LastModified)$/.test(j))) {
				return;
			}
			cell = $('<td>').html(places[i][j]);
			cells.push(cell);
		});
		table.append(row.append(cells));
	});
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//****************************************
// UTILITY FUNCTIONS
//****************************************
// ---------------------------
//
// isNumber
// checks if input is a number
//
// ---------------------------
function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
// ---------------------------
//
// getUnique
// returns unique values of a property
//
// ---------------------------
function getUnique(data) {
	// find unique values of selected property
	var unique = data.filter(function(itm, i, a) {
		return i==a.indexOf(itm);
	});
	// in case no unique values, initialize unique variable
	if (unique == null)
		unique = 0;
		
	return unique;
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//****************************************
// MAIN
//****************************************
// ---------------------------
//
// DOCUMENT.READY
//
// ---------------------------
$(document).ready(function() {
	initializeMap();
	//initializeTable();

	// ----------------
	// GET DATA FROM SQL
	// ----------------
	$.get('php/handler_get.php', function(data) {
		keys = initData(data);

		// ----------------
		// SETUP ADD_FORM
		// ----------------
		populateAddForm(data);

		// ----------------
		// SETUP TABLE
		// ----------------
		//populateTable(data);

		// ----------------
		// SETUP MAP
		// ----------------
		populateMap(data);
		initMapEvents();

		
		// Loading Complete
	})
	.error(function() {
		alert("Error loading data from database");
	});

	// ----------------
	// SEARCH BOX
	// ----------------
});
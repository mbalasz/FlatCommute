var CYCLE_TRAVEL_MODE = "BICYCLING";
var TRANSIT_TRAVEL_MODE = "TRANSIT";
var DAY_IDS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

var map;
var currentFlatMarker;
var selectedFlat;
var markers = [];
var places = [];
var currInfoWindow;
var directionsService;
var directionsDisplay;
var cacheManager;


class Flat {
  constructor(id, address, fullAddress) {
    this.id = id;
    this.address = address;
    this.fullAddress = fullAddress;
  }
}

function initMap() {
  geocoder = new google.maps.Geocoder();
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer({
    suppressMarkers: true
  });
  cacheManager = new CacheManager();
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
  directionsDisplay.setMap(map);
  mapLocationPromises = [];
  places = getInitAddresses();
  for (i = 0; i < places.length; ++i) {
    var place = places[i];
    var address = place.fullAddress;
    var name = place.name;
    var id = place.id;
    var locationPromise = getMapLocation(address);
    (function(id, name, address) {
      locationPromise.then(function(location) {
        var marker = addMarker(location, id);
        addInfoWindow(marker, name + ": " + address);
      });
    })(id, name, address)
    mapLocationPromises.push(locationPromise);
  }
  Promise.all(mapLocationPromises).then(function(mapLocations) {
    onNewFlatSelected(getSelectedFlatFromHTML());
  });
}


function showCyclingRouteToPlace(placeAddress, placeId) {
  if (placeAddress != null) {
    calculateRoute(selectedFlat.fullAddress, placeAddress, CYCLE_TRAVEL_MODE).then(function(directionResult) {
      directionsDisplay.setDirections(directionResult);
    });
  }
}

function showTransitRouteToPlace(placeAddress, placeId) {
  if (placeAddress != null) {
    calculateRoute(selectedFlat.fullAddress, placeAddress, TRANSIT_TRAVEL_MODE).then(function(directionResult) {
      directionsDisplay.setDirections(directionResult);
    });
  }
}

function calculateRoute(origin, destination, travelMode) {
  return new Promise(function(resolve, reject) {
    var today = new Date();
    today.setHours(10);
    directionsService.route({
      origin: origin,
      destination: destination,
      travelMode: travelMode,
      transitOptions: {
        departureTime: today
      },
    }, function(response, status) {
      if (status === 'OK') {
        resolve(response);
      } else {
        reject('Directions request failed due to ' + status)
      }
    });
  });
}

function showRouteStats(directionResult, elementId) {
  document.getElementById(elementId).innerHTML = leg.duration.text;
}

function getTotalCommutes() {
  for (var i = 0; i < DAY_IDS.length; ++i) {
    getTotalCommuteTimePerDay(selectedFlat.id, DAY_IDS[i]);
  }
  getTotalCommuteTimePerWeek(selectedFlat.id);
}


function getTotalCommuteTimePerWeek(flatId) {
  $.ajax({
    url: "totalweekcommute",
    data: {
      'flatId': flatId,
    },
    datatype: 'json',
    success: function(data) {
      document.getElementById('week').innerHTML = data.totalMinutes + " (" + (data.totalMinutes / 60).toFixed(2) + "h)";
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Error getting total commute time per week for flatId " + flatId, textStatus);
    }
  })
}


function getTotalCommuteTimePerDay(flatId, day) {
  $.ajax({
    url: "totaldaycommute",
    data: {
      'flatId': flatId,
      'day': day,
    },
    datatype: 'json',
    success: function(data) {
      document.getElementById(day).innerHTML = data.totalMinutes;
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Error getting total commute time per day for flatId " + flatId + " and day " + day, textStatus);
    }
  })
}

function getAddressByPlaceId(placeId) {
  for (var i = 0; i < places.length; ++i) {
    if (places[i].id == placeId) {
      return places[i].address;
    }
  }
  return null;
}

function updateCommuteTimeToPlaces(flat, places) {
  for (var i = 0; i < places.length; ++i) {
    (function(place) {
      var cyclePromise = calculateRoute(flat.address, place.fullAddress, CYCLE_TRAVEL_MODE);
      cyclePromise.then(function(directionsResult) {
        onDirectionsResult(place, "#cycle-time", directionsResult);
        cacheManager.cacheDistance(flat.address, place.address, directionsResult, CYCLE_TRAVEL_MODE);
      }, function(err) {
        console.log(err);
      });
      var transitPromise = calculateRoute(flat.address, place.fullAddress, TRANSIT_TRAVEL_MODE);
      transitPromise.then(function(directionsResult) {
        onDirectionsResult(place, "#transit-time", directionsResult);
        cacheManager.cacheDistance(flat.address, place.address, directionsResult, TRANSIT_TRAVEL_MODE);
      }, function(err) {
        console.log(err);
      });
    })(places[i]);

    (function(origin, destination) {
      var cyclePromise = calculateRoute(origin, destination, CYCLE_TRAVEL_MODE);
      cyclePromise.then(function(directionsResult) {
        cacheManager.cacheDistance(origin, destination, directionsResult, CYCLE_TRAVEL_MODE);
      }, function(err) {
        console.log(err);
      });
      var transitPromise = calculateRoute(origin, destination, TRANSIT_TRAVEL_MODE);
      transitPromise.then(function(directionsResult) {
        cacheManager.cacheDistance(origin, destination, directionsResult, TRANSIT_TRAVEL_MODE);
      }, function(err) {
        console.log(err);
      });
    })(places[i].address, flat.address);
  }
}

function onDirectionsResult(place, transitTypeId, directionsResult) {
  var leg = directionsResult.routes[0].legs[0];
  updatePlaceDuration(place.id, transitTypeId, leg.duration.text);
}

function updatePlaceDuration(placeId, transitTypeId, duration) {
  document.getElementById(placeId).querySelector(transitTypeId).innerHTML = duration;
}

function addInfoWindow(marker, content) {
  var infoWindow = new google.maps.InfoWindow({
    content: content
  });
  marker.info = infoWindow;
  marker.addListener('click', function() {
    showInfoWindow(infoWindow, marker);
  });
}

function showInfoWindow(infoWindow, marker) {
  if (currInfoWindow != null) {
    currInfoWindow.close();
  }
  currInfoWindow = infoWindow;
  infoWindow.open(map, marker);
}

function showInfoWindowForPlace(placeId) {
  for (i = 0; i < markers.length; ++i) {
    var marker = markers[i];
    if (marker.id == placeId) {
      showInfoWindow(marker.info, marker);
    }
  }
}

function addMarker(location, id, icon) {
  icon = icon || ''
  var marker = new google.maps.Marker({
    map: map,
    position: location,
    id: id,
    icon: icon,
  });
  markers.push(marker);
  return marker;
}

function showSelectedFlat(address) {
  getMapLocation(address).then(function(location) {
    var marker = addMarker(location, null, getFlatMarkerImage());
    addInfoWindow(marker, "Selected flat: " + address);
    setCurrentFlatMarker(marker);
    centerMap();
  })
}

function centerMap() {
  var bounds = new google.maps.LatLngBounds();
  for (i = 0; i < markers.length; ++i) {
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

function getMapLocation(address) {
  return new Promise(function(resolve, reject) {
    geocoder.geocode(
      { 'address': address},
      function(results, status) {
        if (status == 'OK') {
          resolve(results[0].geometry.location);
        } else {
          reject('Geocode was not successful for the following reason: ' + status);
        }
      });
  });
}

function setCurrentFlatMarker(marker) {
 currentFlatMarker = marker;
}

function removeMarker(marker) {
  if (currentFlatMarker == null) {
    return;
  }
  currentFlatMarker.setMap(null);
  var index = markers.indexOf(marker);
  if (index > -1) {
    markers.splice(index, 1);
  }
}

function resetMap() {
  directionsDisplay.setDirections({routes: []});
}

function getSelectedFlatFromHTML() {
  var sel = document.getElementById('current-flat');
  return sel.options[sel.selectedIndex];
}

function resetDistances() {
  var transitTypeIds = ["#cycle-time", "#transit-time"]
  for (var i = 0; i < places.length; ++i) {
    for (var j = 0; j < transitTypeIds.length; ++j) {
      updatePlaceDuration(places[i].id, transitTypeIds[j], "");
    }
  }
}

function onNewFlatSelected(flat) {
  selectedFlat = new Flat(flat.value, flat.text, fullAddress(`${flat.text}`));
  resetDistances();

  placeIds = [];
  for (var i = 0; i < places.length; ++i) {
    placeIds.push(places[i].id);
  }
  cacheManager.getCachedDistances(selectedFlat.id, placeIds).then(function(cachedResults) {
    cachedDistances = cachedResults.distances;
    for (var i = 0; i < cachedDistances.length; ++i) {
      distance = cachedDistances[i];
      transitTypeId = null;
      if (distance.commuteType == "bicycling") {
        transitTypeId = "#cycle-time"
      } else if (distance.commuteType == "transit") {
        transitTypeId = "#transit-time"
      }
      if (transitTypeId == null) {
        console.log("Error, cannot infer transit type for the cached distance. Commute type: " + distance.commuteType);
        continue;
      }
      durationText = distance.minutes + " min";
      updatePlaceDuration(distance.placeId, transitTypeId, durationText);
    }

    placesToUpdate = new Set();
    transitTypeIds = ["bicycling", "transit"];
    for (var i = 0; i < places.length; ++i) {
      var placeId = places[i].id;
      for (var j = 0; j < transitTypeIds.length; j++) {
        if (!existsInCachedDistances(placeId, transitTypeIds[j], cachedDistances)) {
          placesToUpdate.add(places[i]);
        }
      }
    }
    updateCommuteTimeToPlaces(selectedFlat, Array.from(placesToUpdate));
    getTotalCommutes();
  });

  removeMarker(currentFlatMarker);
  resetMap();
  showSelectedFlat(selectedFlat.fullAddress);
}

function existsInCachedDistances(placeId, transitType, cachedDistances) {
  for (var i = 0; i < cachedDistances.length; ++i) {
    distance = cachedDistances[i];
    if (distance.placeId == placeId && distance.commuteType == transitType) {
      return true;
    }
  }
  return false;
}


function getFlatMarkerImage() {
  return 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
}
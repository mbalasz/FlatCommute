var CYCLE_TRAVEL_MODE = "BICYCLING";
var TRANSIT_TRAVEL_MODE = "TRANSIT";

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
  constructor(id, address) {
    this.id = id;
    this.address = address;
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
    var address = place.address;
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
    showSelectedFlat(getSelectedFlatAddressFromHTML());
  });
}

function showCyclingRouteToPlace(placeAddress, placeId) {
  if (placeAddress != null) {
    calculateRoute(selectedFlat.address, placeAddress, CYCLE_TRAVEL_MODE).then(function(directionResult) {
      directionsDisplay.setDirections(directionResult);
    });
  }
}

function showTransitRouteToPlace(placeAddress, placeId) {
  if (placeAddress != null) {
    calculateRoute(selectedFlat.address, placeAddress, TRANSIT_TRAVEL_MODE).then(function(directionResult) {
      directionsDisplay.setDirections(directionResult);
    });
  }
}

function calculateRoute(origin, destination, travelMode) {
  return new Promise(function(resolve, reject) {
    directionsService.route({
      origin: origin,
      destination: destination,
      travelMode: travelMode,
      transitOptions: {
        departureTime: new Date('July 30, 2018 13:24:00')
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

function getAddressByPlaceId(placeId) {
  for (var i = 0; i < places.length; ++i) {
    if (places[i].id == placeId) {
      return places[i].address;
    }
  }
  return null;
}

function updateRouteStats(flat, placeIds) {
  var routePromises = [];
  for (var i = 0; i < placeIds.length; ++i) {
    var placeId = placeIds[i];
    var address = getAddressByPlaceId(placeId);
    (function(placeId) {
      var cyclePromise = calculateRoute(flat.address, address, CYCLE_TRAVEL_MODE);
      routePromises.push(cyclePromise);
      cyclePromise.then(function(directionsResult) {
        onDirectionsResult(placeId, "#cycle-time", directionsResult);
        cacheManager.cacheDistance(flat.id, placeId, directionsResult, CYCLE_TRAVEL_MODE);
      }, function(err) {
        console.log(err);
      });
      var transitPromise = calculateRoute(flat.address, address, TRANSIT_TRAVEL_MODE);
      routePromises.push(transitPromise);
      transitPromise.then(function(directionsResult) {
        onDirectionsResult(placeId, "#transit-time", directionsResult);
        cacheManager.cacheDistance(flat.id, placeId, directionsResult, TRANSIT_TRAVEL_MODE);
      }, function(err) {
        console.log(err);
      });
    })(placeId);
  }
}

function onDirectionsResult(placeId, transitTypeId, directionsResult) {
  var leg = directionsResult.routes[0].legs[0];
  updatePlaceDuration(placeId, transitTypeId, leg.duration.text);
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

function getSelectedFlatAddressFromHTML() {
  var sel = document.getElementById('current-flat');
  var selectedFlat = sel.options[sel.selectedIndex].text;
  return fullAddress(`${selectedFlat}`);
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
  selectedFlat = new Flat(flat.value, fullAddress(`${flat.text}`));
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
      if (distance.commuteType == "cycle") {
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
    transitTypeIds = ["cycle", "transit"];
    for (var i = 0; i < places.length; ++i) {
      var placeId = places[i].id;
      for (var j = 0; j < transitTypeIds.length; j++) {
        if (!existsInCachedDistances(placeId, transitTypeIds[j], cachedDistances)) {
          placesToUpdate.add(placeId);
        }
      }
    }
    updateRouteStats(selectedFlat, Array.from(placesToUpdate));
  });

  removeMarker(currentFlatMarker);
  resetMap();
  showSelectedFlat(selectedFlat.address);
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
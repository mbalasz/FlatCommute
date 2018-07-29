var map;
var currentFlatMarker;
var markers = [];

function initMap() {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
  mapLocationPromises = [];
  initAddresses = getInitAddresses();
  for (i = 0; i < initAddresses.length; ++i) {
    mapLocationPromises.push(getMapLocation(initAddresses[i]));
  }
  Promise.all(mapLocationPromises).then(function(mapLocations) {
    for (i = 0; i < mapLocations.length; ++i) {
      addMarker(mapLocations[i]);
    }
    showSelectedFlat();
  });
}

function addMarker(location, icon) {
  icon = icon || ''
  var marker = new google.maps.Marker({
    map: map,
    position: location,
    icon: icon,
  });
  markers.push(marker);
  return marker;
}

function showSelectedFlat() {
  getMapLocation(getSelectedFlatAddress()).then(function(location) {
    var marker = addMarker(location, getFlatMarkerImage());
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

function getSelectedFlatAddress() {
  var sel = document.getElementById('current-flat');
  var selectedFlat = sel.options[sel.selectedIndex].text;
  return fullAddress(`${selectedFlat}`);
}

function updateFlatMarker() {
  removeMarker(currentFlatMarker);
  showSelectedFlat();
}

function getFlatMarkerImage() {
  return 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
}
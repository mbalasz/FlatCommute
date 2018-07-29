var map;
var currentFlatMarker;
var markers = [];

function initMap() {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
  initAddresses = getInitAddresses();
  addressesLength = initAddresses.length;
  addedMarkers = 0;
  for (i = 0; i < addressesLength; ++i) {
    addPlaceMarker(initAddresses[i], '', function() {
      ++addedMarkers;
      if (addedMarkers === addressesLength) {
        centerMap();
      }
    });
  }
}

function centerMap() {
  var bounds = new google.maps.LatLngBounds();
  for (i = 0; i < markers.length; ++i) {
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

function addPlaceMarker(address, markerIcon, onPlaceShown) {
  console.log("Adding " + `${address}`);
  markerIcon = markerIcon || '';
  geocoder.geocode(
    { 'address': address},
    function(results, status) {
      if (status == 'OK') {
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
            icon: markerIcon,
        });
        markers.push(marker);
        if (onPlaceShown != null) {
          onPlaceShown(marker);
        }
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
}

function onNewFlatMarkerAdded(marker) {
  setCurrentFlatMarker(marker);
  centerMap();
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
  addPlaceMarker(getSelectedFlatAddress(), 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png', onNewFlatMarkerAdded)
}
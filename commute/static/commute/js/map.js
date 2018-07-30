var map;
var currentFlatMarker;
var markers = [];
var places = [];
var currInfoWindow;

function initMap() {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
  mapLocationPromises = [];
  places = getInitAddresses();
  for (i = 0; i < places.length; ++i) {
    var place = places[i];
    var address = place.address;
    var name = place.name;
    var locationPromise = getMapLocation(address);
    (function(name, address) {
      locationPromise.then(function(location) {
        var marker = addMarker(location, name, address);
        addInfoWindow(marker, name + ": " + address);
      });
    })(name, address)
    mapLocationPromises.push(locationPromise);
  }
  Promise.all(mapLocationPromises).then(function(mapLocations) {
    showSelectedFlat();
  });
}

function addInfoWindow(marker, content) {
  var infoWindow = new google.maps.InfoWindow({
    content: content
  });
  marker.addListener('click', function() {
    if (currInfoWindow != null) {
      currInfoWindow.close();
    }
    currInfoWindow = infoWindow;
    infoWindow.open(map, marker);
  });
}

function addMarker(location, name, address, icon) {
  icon = icon || ''
  var marker = new google.maps.Marker({
    map: map,
    position: location,
    address: address,
    name: name,
    icon: icon,
  });
  markers.push(marker);
  return marker;
}

function showSelectedFlat() {
  var address = getSelectedFlatAddress()
  getMapLocation(address).then(function(location) {
    var marker = addMarker(location, '', address, getFlatMarkerImage());
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
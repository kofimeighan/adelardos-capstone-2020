// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.let map;
/* exported onLoad */
/* exported codeAddress */
/* exported marker */
// Neccessary constants or else variables will return as
// 'undefined' in lint checks
let map;
let geocoder;
let marker;
const google = window.google;
// Center points to Minneapolis, Minnesota
const INITIAL_LAT = 44.9778;
const INITIAL_LNG = -93.2650;

function onLoad() {
  loadMap();
}

function loadMap() {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: INITIAL_LAT, lng: INITIAL_LNG},
    zoom: 18,
    mapTypeId: 'satellite',
  });
}

function codeAddress(address) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location);
      marker = new google.maps.Marker(
          {map: map, position: results[0].geometry.location, animation: google.maps.Animation.DROP});
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
  marker.addListener('click', toggleBounce);
}

function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

function authenticationStatus() {
  const response = fetch('/login');
  if(response.ok) {}
}
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
/* exported insertSearch */
// Neccessary constants or else variables will return as
// 'undefined' in lint checks

// Center points to the middle of the United States
// TODO(kofimeighan): Try and figure out how to decrease
// the scope of these variables. maybe within a new class?

let map;
let geocoder;
const google = window.google;
const MNPLS_LAT = 44.9778;
const MNPLS_LNG = -93.2650;


// TODO(kofimeighan): add an event listener to when
// the page is loaded and call
// onLoad();
function onLoad() {
  const martyrData = [
    ['George Floyd', 'Minneapolis, Minnesota'],
    ['Ahmaud Arbery', 'Brunswick, Georgia'],
    ['Breonna Taylor', 'Louisville, Kentucky'],
    ['Rayshard Brooks', 'Atlanta, Georgia'],
    ['Robert Fuller', 'Palmdale, California'],
    ['James Scurlock', 'Omaha, Nebraska'],
    ['Elijah McClain', 'Aurora, Colorado'],
    ['Placeholder', 'Mountain View, CA'],
    ['Placeholder', 'Mountain View, CA'],
  ];

  const iconicProtestData = [
    [
      'Black panthers storming the California capitol',
      'California State Capitol, 1315 10th St room b-27,' +
          'Sacramento, CA 95814',
    ],
    ['Martin Luther King\'s march on Washington', 'Washington, D.C.'],
    [
      'Rev. Al Sharpton\'s march on Washington on August 28th, 2020',
      'Washington, D.C.',
    ],
  ];

  loadMap();
  populateDropdown(martyrData, 'martyr-dropdown-menu');
  populateDropdown(iconicProtestData, 'IP-dropdown-menu');
  fetchSubmittedLocations().then((locationData) =>
    populateDropdown(locationData, 'user-submitted-dropdown-menu'));
}

function loadMap() {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: MNPLS_LAT, lng: MNPLS_LNG},
    zoom: 18,
    mapTypeId: 'satellite',
  });
}

function codeAddress(address) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location);
      new google.maps.Marker({
        map: map,
        position: results[0].geometry.location,
        animation: google.maps.Animation.DROP,
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function populateDropdown(list, ID) {
  const dropDownMenu = document.getElementById(ID);
  list.forEach((nameAndLocation) => {
    const listElement = document.createElement('li');
    listElement.innerText = nameAndLocation[0];

    const titleElement = document.createElement('a');
    titleElement.innerText = '';
    listElement.appendChild(titleElement);

    listElement.addEventListener('click', () => {
      codeAddress(nameAndLocation[1]);
    });

    dropDownMenu.appendChild(listElement);
  });
}

function insertSearch() {
  const searchBar = document.createElement('form');
  searchBar.className = 'form-inline mr-auto';

  const searchDiv = document.createElement('div');
  searchDiv.className = 'md-form my-0';

  const searchInput = document.createElement('input');
  searchInput.className = 'form-control form-inline';
  searchInput.type = 'text';
  searchInput.placeholder = 'Search';

  const searchI = document.createElement('i');
  searchI.className = 'fas fa-search text-white ml-3 mr-auto';

  searchDiv.appendChild(searchInput);
  searchDiv.appendChild(searchI);
  searchBar.appendChild(searchDiv);

  document.getElementById('mainNav').appendChild(searchBar);
}

async function fetchSubmittedLocations() {
  const response = await fetch('/submitted-locations');
  const userComments = await response.json();
  const commentData = [];

  userComments.forEach((comment) => {
    const tempArray = [comment.name, comment.location];
    commentData.push(tempArray);
  });

  return commentData;
}

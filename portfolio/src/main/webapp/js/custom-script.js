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
/* global google */
// Neccessary constants or else variables will return as
// 'undefined' in lint checks

// Center points to the middle of the United States
// TODO(kofimeighan): Try and figure out how to decrease
// the scope of these variables. maybe within a new class?

let map;
let geocoder;
window.onLoad = onLoad;
window.insertSearch = insertSearch;
const INITIAL_LAT = 39.8283;
const INITIAL_LNG = -98.5795;

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

  const ipData = [
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
  populateDropdown(ipData, 'IP-dropdown-menu');
}

function loadMap() {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: INITIAL_LAT, lng: INITIAL_LNG},
    zoom: 4,
    mapTypeId: 'satellite',
  });
}

function codeAddress(address) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location);
      new google.maps.Marker(
          {map: map, position: results[0].geometry.location});
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

// inserts a functioning searchbar into the navigation bar of a page.
function insertSearch() {
  const searchVisual = createSearch();
  const elementArray = Array.from(document.body.childNodes);
  searchVisual.onkeyup = function() {
    const resultArray = searchPages(elementArray);
    console.log(resultArray);
    showResults(resultArray);
  };
  document.getElementById('mainNav').appendChild(searchVisual);
}

// creates the html search skeleton that the user interacts with
function createSearch() {
  const searchBar = document.createElement('form');
  searchBar.className = 'form-inline mr-auto';

  const searchDiv = document.createElement('div');
  searchDiv.className = 'md-form my-0';

  const searchInput = document.createElement('input');
  searchInput.className = 'form-control form-inline';
  searchInput.id = 'userSearch';
  searchInput.type = 'text';
  searchInput.placeholder = 'Search';

  const searchI = document.createElement('i');
  searchI.className = 'fas fa-search text-white ml-3 mr-auto';

  const searchResults = document.createElement('ul');
  searchResults.id = 'searchResults';

  searchDiv.appendChild(searchInput);
  searchDiv.appendChild(searchI);
  searchBar.appendChild(searchDiv);
  searchBar.append(searchResults);

  return searchBar;
}

// searches each child Node of the page in the elementArray and retains the
// elements that contain the wanted word
function searchPages(elementArray) {
  const wantedWords = document.getElementById('userSearch').value.toLowerCase();
  const arrayLength = elementArray.length;

  const resultArray = [];
  const backArray = [];
  if (wantedWords.length > 0) {
    for (let i = 0; i < arrayLength / 2; i++) {
      const frontElement = elementArray[i];
      let frontElementText = frontElement.innerText;
      if (frontElementText) {
        frontElementText = frontElementText.toLowerCase();
        if (frontElementText.includes(wantedWords)) {
          resultArray.push(frontElement);
        }
      }

      const backElement = elementArray[arrayLength - 1 - i];
      let backElementText = backElement.innerText;
      if (backElementText) {
        backElementText = backElementText.toLowerCase();
        if (backElementText.includes(wantedWords)) {
          backArray.unshift(backElement);
        }
      }
    }
  }

  resultArray.concat(backArray);
  return resultArray;
}

// populates the search skeleton with the results and sets the functionality to
// navigate to the result by clicking on it.
function showResults(resultArray) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = '';

  resultArray.forEach(function(result) {
    const textElement = document.createElement('li');
    textElement.innerText = result.innerText.substring(0, 10);

    textElement.onclick = function() {
      result.scrollIntoView();
    };

    searchResults.prepend(textElement);
  });
}

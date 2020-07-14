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

/**
 * Neccessary constants or else variables will return as 'undefined' in lint
   checks
*/
/* exported onLoad */
/* exported codeAddress */
/* exported insertSearch */
/* exported allowUserSubmit */
/* exported statisticsOnLoad */
/* global google */
<<<<<<< HEAD
// Neccessary constants or else variables will return as
// 'undefined' in lint checks
// Center points to the middle of the United States
// TODO(kofimeighan/briafassler): Try and figure out how to decrease
// the scope of these variables. maybe within a new class?
=======
>>>>>>> origin

/**
 * Center points to the middle of the United Statesd
 * TODO(kofimeighan/briafassler): Try and figure out how to decrease
   the scope of these variables. maybe within a new class?
 */
let map;
let geocoder;
const MNPLS_LAT = 44.9778;
const MNPLS_LNG = -93.2650;

<<<<<<< HEAD
// TODO(kofimeighan): add an event listener to when
// the page is loaded and call
=======
/**
 * TODO(kofimeighan): add an event listener to when the page is loaded and
   call onLoad();
 */
>>>>>>> origin
function onLoad() {
  insertSearch();
  renderLoginButton();
}

function statisticsOnLoad() {
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
  insertSearch();
  renderLoginButton();
  populateDropdown(martyrData, 'martyr-dropdown-menu');
  populateDropdown(iconicProtestData, 'IP-dropdown-menu');
  fetchSubmittedLocations().then((locationData) => {
    populateDropdown(locationData, 'user-submitted-dropdown-menu');
  });
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

/* inserts a functioning searchbar into the navigation bar of a page. */
function insertSearch() {
  const searchElement = createSearchElement();
  const docElements = Array.from(document.body.childNodes);
  searchElement.onkeyup = function() {
    const wantedWords =
        document.getElementById('searchQuery').value.toLowerCase();
    const resultElements = searchPages(docElements, wantedWords);
    showResults(resultElements, wantedWords);
  };
  document.getElementById('mainNav').appendChild(searchElement);
}

/* creates the html search skeleton that the user interacts with */
function createSearchElement() {
  const searchBar = document.createElement('form');
  searchBar.className = 'form-inline mr-auto';

  const searchDiv = document.createElement('div');
  searchDiv.className = 'md-form my-0';

  const searchInput = document.createElement('input');
  searchInput.className = 'form-control form-inline';
  searchInput.id = 'searchQuery';
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

async function renderLoginButton() {
  const response = await fetch('/login');
  const authenticationURL = await response.text();

  const navBar = document.getElementById('navBar');

  const welcomeElement = document.createElement('li');
  welcomeElement.className = 'nav-item';
  welcomeElement.innerHTML = authenticationURL;

  navBar.appendChild(welcomeElement);
}

async function fetchSubmittedLocations() {
  const response = await fetch('/submitted-locations');
  const userComments = await response.json();
  const commentData = [];

  userComments['userComments'].forEach((comment) => {
    const tempArray = [comment.name, comment.location];
    commentData.push(tempArray);
  });
}

/* searches each child Node of the page in the docElements and retains the
   elements that contain the wanted word. */
function searchPages(docElements, wantedWords) {
  const resultElements = [];

  if (wantedWords.length <= 0) {
    return resultElements;
  }

  docElements.forEach((element) => {
    let elementText = element.innerText;

    if (elementText) {
      elementText = elementText.toLowerCase();
      if (elementText.includes(wantedWords)) {
        resultElements.push(element);
      }
    }
  });

  return resultElements;
}

/**
 * populates the search skeleton with the results and sets the functionality to
   navigate to the result by clicking on it.
 */
function showResults(resultElements, wantedWords) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = '';

  resultElements.forEach((result) => {
    if (result.getAttribute('aria-hidden') == 'true' ||
        result.id == 'mainNav') {
      return;
    }

    const textElement = document.createElement('li');
    let resultText = result.innerText.replace(/\s\s+/g, ' ').trim();
    resultText = resultText.replace(/[\n\r]/g, ' ');
    const searchPos = resultText.toLowerCase().indexOf(wantedWords);
    textElement.innerText = '...' +
        resultText.substring(searchPos - 10, searchPos).replace(/^\s+/g, '') +
        resultText.substring(searchPos, searchPos + 20).trim() + '...';

    textElement.onclick = function() {
      result.scrollIntoView();
    };

    searchResults.append(textElement);
  });
}

function allowUserSubmit() {
  fetch('/submitted-locations')
      .then((response) => response.json())
      .then((payout) => {
        if (!payout['isUserLoggedIn']) {
          alert('Please login to place a pin!');
        }
      });
}
google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawStateIncarcerationChart);

/** Creates chart and adds it to the page. */
function drawStateIncarcerationChart() {
  const stateData = new google.visualization.DataTable();
  stateData.addColumn('string', 'Race');
  stateData.addColumn('number', 'Count');
  stateData.addRows([
    ['Whites', 201],
    ['Blacks', 1767],
    ['Hispanics', 385],
  ]);

  const stateChartDimensions = {
    'title': 'Incarceration Rates (per 100,000) by Race in California',
    'width': 500,
    'height': 400,
  };

  const chart = new google.visualization.PieChart(
      document.getElementById('chart-container'));
  chart.draw(stateData, stateChartDimensions);
}

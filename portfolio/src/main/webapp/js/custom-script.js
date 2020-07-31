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
/* exported placeMarker */
/* exported insertSearch */
/* exported allowUserSubmit */
/* exported statisticsOnLoad */
/* exported placeProximityPins */
/* exported loadChartData */
/* global google */
/* global Chart*/
// Neccessary constants or else variables will return as
// 'undefined' in lint checks
// Center points to the middle of the United States
// TODO(kofimeighan/briafassler): Try and figure out how to decrease
// the scope of these variables. maybe within a new class?

let map;
let geocoder;
const MNPLS_LAT = 44.9778;
const MNPLS_LNG = -93.2650;

// TODO(kofimeighan): add an event listener to when the page is loaded and
// call onLoad();

// TODO(brifassler/kofimeighan/chidawaya): add docstrings for all functions

function onLoad() {
  loadSearch();
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
    ['Jamel Floyd', 'Brooklyn, New York'],
  ];

  const iconicProtestData = [
    [
      'Black Panthers Storming the California Capitol on May 2nd, 1967',
      'California State Capitol, 1315 10th St room b-27,' +
          'Sacramento, CA 95814',
    ],
    [
      'Martin Luther King\'s March on Washington on August 28th, 1963',
      'Washington, D.C.',
    ],
    [
      'Rev. Al Sharpton\'s March on Washington on August 28th, 2020',
      'Washington, D.C.',
    ],
  ];

  drawTimeSeriesChart();
  drawInteractiveChart();
  insertSearch();
  loadMap();
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
    zoom: 14,
    mapTypeId: 'satellite',
  });
}

/**
 * Places a marker on the current loaded map at the given location with an
 * information window
 * @param {String} address Postal address of the location you would like to
 *     place a marker on the map for
 */
function placeMarker(nameAndLocation) {
  geocoder.geocode({'address': nameAndLocation[1]}, function(results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location);
      const marker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location,
        animation: google.maps.Animation.DROP,
      });

      const content = '<div id="content">' +
          '<div id="siteNotice">' +
          '</div>' +
          '<div id="bodyContent">' +
          '<b>' + nameAndLocation[0] + '</b><br>' + nameAndLocation[1] +
          '</div>' +
          '</div>';

      const infoWindow = new google.maps.InfoWindow({
        content: content,
      });

      marker.addListener('click', function() {
        infoWindow.open(map, marker);
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

/**
 * Places marker on the loaded map with the person's race, cause of death, date
 * of death, and distance from the incident to the user
 * @param {JSON} pin json object of pins from the database
 * @param {Number} distance distance between the user's location and
 */
function addProximityPinAndWindow(pin, distance) {
  geocoder.geocode({'address': pin.address}, function(results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location);
      const marker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location,
        animation: google.maps.Animation.DROP,
      });

      const formattedRace =
          pin.race.charAt(0).toUpperCase() + pin.race.slice(1);

      const windowContent = '<div id="content">' +
          '<div id="siteNotice">' +
          '</div>' +
          '<div id="bodyContent">' +
          '<p>Race: <b>' + formattedRace + '</b><br>' +
          'Cause Of Death: <b>' + pin.causeOfDeath + '</b><br>' +
          'Date of Death: <b>' + pin.dateOfDeath + '</b><br>' +
          'This incident occured <b><i>' + Math.floor(distance) +
          ' miles </i></b> away from you.' +
          '</div>' +
          '</div>';

      const infoWindow = new google.maps.InfoWindow({
        content: windowContent,
      });

      marker.addListener('click', function() {
        infoWindow.open(map, marker);
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function populateDropdown(list, ID) {
  const dropDownMenu = document.getElementById(ID);
  list.forEach((nameAndLocation) => {
    const titleElement = document.createElement('a');
    titleElement.className = 'dropdown-item';
    titleElement.innerText = nameAndLocation[0];

    titleElement.addEventListener('click', () => {
      placeMarker(nameAndLocation);
    });

    dropDownMenu.appendChild(titleElement);
  });
}

/**
 * Places pins on the map in a given radius set by the user
 */
async function placeProximityPins() {
  const state = document.getElementById('state').value;
  const userAddress = document.getElementById('address').value;
  const response = await fetch('/proximity-pins?state=' + state);
  const pins = await response.json();
  const radius = Number(document.getElementById('radius').value);

  pins.forEach(async (pin, index, array) => {
    if (await haversineDistance(userAddress, pin.address) < radius) {
      const distance = await haversineDistance(userAddress, pin.address);
      addProximityPinAndWindow(pin, distance);
      if (index == array.length - 1) {
        map.setCenter(addressToCoordinates(userAddress)[2]);
      }
    }
  });
}

/**
 * Calculates the distance between two coordinate sets in miles
 * @param {String} userAddress as the point to calculate the distance from
 * @param {String} dataPoint as the point to calculate the distance between
 * @return {number} Distance in miles.
 */
async function haversineDistance(userAddress, dataPoint) {
  const userAddressLatLong = await addressToCoordinates(userAddress);
  const pinAddressLatLong = await addressToCoordinates(dataPoint);

  const radiusOfEarth = 3958.8;
  const userAddLatInRadians = userAddressLatLong[0] * (Math.PI / 180);
  const pinAddLatInRadians = pinAddressLatLong[0] * (Math.PI / 180);
  const lattitudeDifference = pinAddLatInRadians - userAddLatInRadians;
  const longitudeDifference =
      (pinAddressLatLong[1] - pinAddressLatLong[1]) * (Math.PI / 180);


  const distanceBetweenPins = 2 * radiusOfEarth *
      Math.asin(Math.sqrt(
          Math.sin(lattitudeDifference / 2) *
              Math.sin(lattitudeDifference / 2) +
          Math.cos(userAddLatInRadians) * Math.cos(pinAddLatInRadians) *
              Math.sin(longitudeDifference / 2) *
              Math.sin(longitudeDifference / 2)));
  return distanceBetweenPins;
}

/**
 * Converts an address into latitude and longitude coordinate sets
 * @param {String} address original delivery address to calculate the
 *     coordinates of
 * @return {Array} Array of size 2 that contains the address' coordinates
 */
async function addressToCoordinates(address) {
  const addressQuery = new Promise((resolve, reject) => {
    geocoder.geocode({'address': address}, function(results, status) {
      if (status == 'OK') {
        resolve([
          results[0].geometry.location.lat(),
          results[0].geometry.location.lng(),
          results[0].geometry.location,
        ]);
      } else {
        reject(status);
      }
    });
  });

  return addressQuery;
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

  return commentData;
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

/**
 * Gets the other html pages as documents and invokes method to insert search
    bar
 */
async function loadSearch() {
  const otherDocs =
      await Promise.all([getHTML('/about.html'), getHTML('/statistics.html')]);

  let otherElements = [];
  otherDocs.forEach((doc) => {
    otherElements = [...otherElements, ...Array.from(doc.body.childNodes)];
  });

  insertSearch(otherElements);
}

/**
 * Get HTML asynchronously as document
 * @param {String} url: The URL to get HTML from
 */
async function getHTML(url) {
  return new Promise((resolve, reject) => {
    // Feature detection
    if (!window.XMLHttpRequest) {
      return;
    }

    // Create new request
    const xhr = new XMLHttpRequest();

    // Setup callback
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.responseXML);
      } else {
        reject(xhr.statusText);
      }
    };

    // Get the HTML
    xhr.open('GET', url);
    xhr.responseType = 'document';
    xhr.send();
  });
}

/**
 * inserts a functioning searchbar into the navigation bar of a page.
 * @param {array} otherElements: The elements from every other pages
 */
function insertSearch(otherElements) {
  const searchElement = createSearchElement();
  const docElements = Array.from(document.body.childNodes);

  searchElement.onkeyup = function() {
    const wantedWords =
        document.getElementById('searchQuery').value.toLowerCase();
    const resultElements = searchElements(docElements, wantedWords);
    const otherResultElements = searchElements(otherElements, wantedWords);
    showResults(resultElements, wantedWords);
    showOtherResults(otherResultElements, wantedWords);
  };

  document.getElementById('mainNav').appendChild(searchElement);
}

/**
 * creates the html search skeleton that the user interacts with
 * @return {DOM} searchDiv: div with input bar and results element.
 */
function createSearchElement() {
  const searchBar = document.createElement('form');
  searchBar.className = 'form-inline';

  const searchDiv = document.createElement('div');
  searchDiv.className = 'md-form my-0';

  const searchInput = document.createElement('input');
  searchInput.className = 'form-control form-inline';
  searchInput.id = 'searchQuery';
  searchInput.type = 'text';
  searchInput.placeholder = 'Search';

  const searchResults = document.createElement('ul');
  searchResults.id = 'searchResults';

  searchDiv.appendChild(searchInput);
  searchDiv.appendChild(searchResults);

  return searchDiv;
}

/**
 * searches each node in docElements and retains relevant elements
 * @param {array} docElements: The elements from to search
 * @param {String} wantedWords: The users entered search query
 * @return {array} resultElements: The relevant results as elements
 */
function searchElements(docElements, wantedWords) {
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
   scroll the result it into view by clicking on it.
* @param {Array} resultElements: elements containing the wanted words from page
   the user is currently on.
* @param {String} wantedWords: the search query the user entered
*/
function showResults(resultElements, wantedWords) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = '';

  resultElements.forEach((result) => {
    if (result.getAttribute('aria-hidden') == 'true' ||
        result.id == 'mainNav') {
      return;
    }

    const textElement = createResult(result, wantedWords)[1];
    textElement.onclick = function() {
      result.scrollIntoView();
    };

    searchResults.appendChild(textElement);
  });
}

/**
* populates the search skeleton with the results and sets the functionality to
   redirect to page result is on, whilst sending a hash for it to be found.
* @param {Array} otherResultElements: elements containing the wanted words from
   the pages the user is not currently on.
* @param {String} wantedWords: the search query the user entered
*/
function showOtherResults(otherResultElements, wantedWords) {
  otherResultElements.forEach((result) => {
    if (result.getAttribute('aria-hidden') == 'true' ||
        result.id == 'mainNav') {
      return;
    }

    const [outputText, textElement] = createResult(result, wantedWords);
    const docUrl = result.ownerDocument.URL;
    const hash = encodeURI('#' + outputText + '#' + wantedWords);

    textElement.onclick = function() {
      window.location.href = docUrl + hash;
    };

    document.getElementById('searchResults').append(textElement);
  });
}

/**
* creates the element that the result will be displayed in
* @param {Array} result: element to display to user.
* @param {String} wantedWords: the search query the user entered
* @result {String} outputText: the text displayed to the user
* @result {DOM} textElement: the element the outputText is
   displayed.
*/
function createResult(result, wantedWords) {
  const textElement = document.createElement('li');
  let resultText = result.innerText.replace(/\s\s+/g, ' ').trim();
  resultText = resultText.replace(/[\n\r]/g, ' ');
  const searchPos = resultText.toLowerCase().indexOf(wantedWords);
  const outputText =
      resultText.substring(searchPos - 10, searchPos).replace(/^\s+/g, '') +
      resultText.substring(searchPos, searchPos + 20).trim();
  textElement.innerText = '...' + outputText + '...';

  return [outputText, textElement];
}

/** Adds a line chart to page showing the global avg temp from a csv */
async function drawTimeSeriesChart() {
  const tempData = await getTempData();
  const chart = {
    type: 'line',
    data: {
      labels: tempData.xAxis,
      datasets: [{
        label: 'Mean Temp',
        backgroundColor: 'rgb(255, 0, 0)',
        fill: false,
        borderColor: 'rgb(255, 0, 0)',
        data: tempData.yAxis,
      }],
    },

    options: {
      reponsive: true,
      title: {
        display: true,
        text: 'Zonal Annual Temperature Mean',
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Year',
          },
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Temperature Mean',
          },
        }],
      },
    },
  };

  const timeSeries = document.getElementById('timeseries').getContext('2d');
  new Chart(timeSeries, chart);

  async function getTempData() {
    // Source of Data: https://data.giss.nasa.gov/gistemp/
    const xAxis = [];
    const yAxis = [];

    // TODO(briafassler): move globaltemp.csv into csv folder and change file
    // path
    const response = await fetch('globaltemp.csv');
    const zonalTempData = await response.text();

    const table = zonalTempData.split('\n').slice(1);
    table.forEach((row) => {
      const columns = row.split(',');
      const year = columns[0];
      xAxis.push(year);
      const temp = columns[1];
      yAxis.push(parseFloat(temp) + 14);
    });
    return {xAxis, yAxis};
  }
}

async function loadChartData() {
  const response = await fetch('/chart-data');
  const dataPairs = await response.json();
  const chartData = [];

  dataPairs.forEach((pair) => {
    chartData.push([pair.group, pair.percent]);
  });

  return chartData;
}

/** TODO(briafassler): fix the scope of google  */
// google.charts.load('current', {'packages': ['corechart']});
// google.charts.setOnLoadCallback(drawInteractiveChart);

/** Draws user inputted pie chart and adds to page. */
function drawInteractiveChart() {
  fetch('/interactive-chart')
      .then((response) => response.json())
      .then((emotionVotes) => {
        const emotionData = new google.visualization.DataTable();
        emotionData.addColumn('string', 'Emotion');
        emotionData.addColumn('number', 'Votes');
        Object.keys(emotionVotes).forEach((emotion) => {
          emotionData.addRow([emotion, emotionVotes[emotion]]);
        });

        const options = {
          'width': 650,
          'height': 500,
          'is3D': true,
          'backgroundColor': '#f8f9fa',
          'animation': {'startup': true},
          'colors': ['#900c3f', '#c70039', '#ff5733', 'ffc300'],
        };

        const interactiveChart = new google.visualization.PieChart(
            document.getElementById('chart-container'));
        interactiveChart.draw(emotionData, options);
      });
}

// TODO(briafassler): Don't leave function here
typewriterFeature();

function typewriterFeature() {
  const typedText = document.querySelector('.typed-text');
  /**
   * TODO Stretch Feature(briafassler): read names from a database instead of an
   * array
   */
  const MARTYR_NAMES = [
    'George Floyd',          'Breonna Taylor',  'Ahmaud Arbery',
    'Rayshard Brooks',       'Robert Fuller',   'James Scurlock',
    'Elijah McClain',        'Justin Howell',   'Jamel Floyd',
    'Eric Garner',           'Michael Brown',   'Eric Reason',
    'Sandra Bland',          'Jamar Clark',     'Tamir Rice',
    'John Crawford III',     'Phillip White',   'Ezell Ford',
    'Dante Parker',          'Laquan McDonald', 'Dominique Clayton',
    'Michelle Cusseaux',     'George Mann',     'Tanisha Anderson',
    'Akai Gurley',           'Alonzo Smith',    'Stephon Clark',
    'Philando Castile',      'Janet Wilson',    'Darrius Stewart',
    'Botham Jean',           'Samuel Dubose',   'Willie Tillman',
    'Quintonio Legrier',     'Brian Keith Day', 'Christian Taylor',
    'Junior Prosper',        'Freddie Gray',    'Christopher McCorvey',
    'Peter Gaines',          'Mya Hall',        'Felix Kumi',
    'Keith Harrison McLeod', 'Anthony Ashford', 'Salvado Ellswood',
  ];
  let marytrNamesIndex = 0;
  let charIndex = 0;

  function typeName() {
    if (charIndex < MARTYR_NAMES[marytrNamesIndex].length) {
      typedText.textContent += MARTYR_NAMES[marytrNamesIndex].charAt(charIndex);
      charIndex++;
      setTimeout(typeName, 150);
    } else {
      setTimeout(eraseName, 2000);
    }
  }

  function eraseName() {
    if (charIndex > 0) {
      typedText.textContent =
          MARTYR_NAMES[marytrNamesIndex].substring(0, charIndex - 1);
      charIndex--;
      setTimeout(eraseName, 100);
    } else {
      marytrNamesIndex++;
      if (marytrNamesIndex >= MARTYR_NAMES.length) {
        marytrNamesIndex = 0;
      }
      setTimeout(typeName, 1300);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    if (MARTYR_NAMES.length) setTimeout(typeName, 2250);
  });
}

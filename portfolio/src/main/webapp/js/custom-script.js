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
/* exported allowUserSubmit */
/* exported statisticsOnLoad */
/* exported placeProximityPins */
/* exported loadChartData */
/* global google */
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
  searchHash();
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

  drawCharts();
  loadMap();
  renderLoginButton();
  populateDropdown(martyrData, 'martyr-dropdown-menu');
  populateDropdown(iconicProtestData, 'IP-dropdown-menu');
  fetchSubmittedLocations().then((locationData) => {
    populateDropdown(locationData, 'user-submitted-dropdown-menu');
  });

  searchHash();
  loadSearch();
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

  pins.reduce(async (previousPin, pin, index) => {
    await previousPin;
    const distance = await haversineDistance(userAddress, pin.address);
    // Prevents OVER_QUERY_LIMIT return value from geocoder
    await sleep(2800);
    if (distance < radius) {
      addProximityPinAndWindow(pin, distance);
      if ((index == pins.length - 1) || (index == 25)) {
        map.setCenter(await addressToCoordinates(userAddress)[2]);
        return;
      }
    }
  }, Promise.resolve());
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

/**
 * Function to delay execution
 * @param {Number} ms The amount of time in milliseconds you want to pause the
 *     function
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const otherPageLinks = getOtherLinks();
  const otherDocs = await Promise.all(otherPageLinks.map(getHTML));

  let otherElements = [];
  otherDocs.forEach((doc) => {
    otherElements = [...otherElements, ...Array.from(doc.body.childNodes)];
  });

  insertSearch(otherElements);
}

/**
 * Gets links from the navigation bar
 * Removes link for current page we are on
 * @return {array}: the links from other pages.
 */
function getOtherLinks() {
  const pagePath = window.location.pathname;
  const pathSize = pagePath.length;
  const linkElements =
      Array.from(document.getElementById('navBar').getElementsByTagName('a'));
  const wantedLinks = [];

  linkElements.forEach((linkElement) => {
    const link = linkElement.href;
    if (pathSize < 2) {
      if (link.includes('index')) {
        return;
      }
    } else if (link.includes(pagePath)) {
      return;
    }
    wantedLinks.push('/' + linkElement.getAttribute('href'));
  });

  return wantedLinks;
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
    const hash = encodeURI('#' + outputText);

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

function searchHash() {
  const urlHash = window.location.hash;
  if (urlHash) {
    const hashArray = urlHash.split('#');
    const outputText = decodeURI(hashArray[1]).substring(0, 5).toLowerCase();

    const docElements = Array.from(document.body.childNodes);
    const resultElement = searchElements(docElements, outputText)[0];
    resultElement.scrollIntoView();
  }
}

async function loadChartData(window) {
  const response = await window.fetch('/chart-data');
  const dataPairs = await response.json();
  const chartData = [];

  dataPairs.forEach((pair) => {
    chartData.push([pair.group, pair.percent]);
  });

  return chartData;
}

/**
 * calls the timeseries and interactive chart, and fetches the data from
 * their respective servlets.
 */
function drawCharts() {
  google.charts.load('current', {'packages': ['corechart']});
  google.charts.setOnLoadCallback(drawTimeSeriesChart);
  google.charts.setOnLoadCallback(drawCityBudgetsChart);
  google.charts.setOnLoadCallback(drawInteractiveChart);


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

  /** Fetches police killings data and uses it to create a chart. */
  function drawTimeSeriesChart() {
    fetch('/chart-data')
        .then((response) => response.json())
        .then((policeKillings) => {
          const data = new google.visualization.DataTable();
          data.addColumn('string', 'Year');
          data.addColumn('number', 'People');
          policeKillings.forEach((dataPair) => {
            data.addRow([dataPair.year.toString(), dataPair.amountKilled]);
          });

          const options = {
            'width': 800,
            'height': 550,
            'backgroundColor': '#f8f9fa',
            'animation': {'startup': true},
            'colors': ['#900c3f'],
            'hAxis': {
              'title': 'Year',
            },
            'vAxis': {
              'title': 'Amount of People Killed',
            },
          };

          const chart = new google.visualization.LineChart(
              document.getElementById('timeseries'));
          chart.draw(data, options);
        });
  }

  /** Creates a column chart with city budget spending */
  function drawCityBudgetsChart() {
    const data = google.visualization.arrayToDataTable([
      [
        'Area',
        'Police',
        'Public Welfare',
        'Health',
        'Housing',
        'Parks and Rec',
      ],

      // Data Source:
      // https://www.businessinsider.com/police-spending-compared-to-other-expenditures-us-cities-2020-6#police-spending-in-philadelphia-was-nearly-430-per-resident-in-2017-5
      ['Los Angeles, CA', 754, 572, 475, 399, 159],
      ['New York, NY', 672, 971, 145, 687, 145],
      ['Boston, MA', 552, 5, 26, 674, 138],
      ['Philadelphia, PA', 427, 127, 1069, 471, 65],
      ['Baltimore, MD', 807, 0, 189, 683, 60],
    ]);

    const options = {
      vAxis: {title: 'Spending per Capita'},
      hAxis: {title: 'Cities'},
      backgroundColor: '#f8f9fa',
      seriesType: 'bars',
      colors: ['#581845', '#900c3f', '#c70039', '#ff5733', 'ffc300'],
    };

    const chart = new google.visualization.ComboChart(
        document.getElementById('chart_div'));
    chart.draw(data, options);
  }
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

/*
 * Lint checks disabled to allow exports for Jasmine testing.
 */
/* eslint-disable */
exports.createResult = createResult;
exports.insertSearch = insertSearch;
exports.createSearchElement = createSearchElement;
exports.searchElements = searchElements;

exports.loadChartData = loadChartData;
/* eslint-enable */

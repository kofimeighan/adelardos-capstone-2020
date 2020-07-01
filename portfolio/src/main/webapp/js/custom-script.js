/* exported insertSearch */
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

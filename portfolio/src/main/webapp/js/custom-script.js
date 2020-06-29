/* exported insertSearch */
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

  // console.log(document.body.innerText);
  // var elements = Array.from(document.body.childNodes);
  // elements.forEach(function(item){
  //   var val = item.innerText;
  //   if(val) {
  //     item.scrollIntoView()
  //     console.log(val);
  //   }
  // })
}

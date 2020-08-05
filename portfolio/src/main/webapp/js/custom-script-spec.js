const custom = require('./custom-script.js');
const jsdom = require('jsdom');  
const { JSDOM } = jsdom;
const { document } = (new JSDOM('<!DOCTYPE html>')).window;
global.document = document;

describe("Testing onLoad()", () => {
  beforeEach(() => {
    spyOn(custom, "loadSearch");
    spyOn(custom, "renderLoginButton");
  });

  it("test executing correct methods", () => {
    custom.onLoad();
    expect(custom.loadSearch).toHaveBeenCalledTimes(1);
    expect(custom.renderLoginButton).toHaveBeenCalled();
  });

  it("test not executing all methods", () => {
    spyOn(custom, "insertSearch");
    spyOn(custom, "searchElements");
    custom.onLoad();
    expect(custom.insertSearch).not.toHaveBeenCalled();
    expect(custom.searchElements).not.toHaveBeenCalled();
  });
});

describe("Testing loadChartData()", () => {
  it("empty result from endpoint", (done) => {
    var fakeWindow = {
      fetch: function() {return {
        json: function() {return []}
      }}
    };
    custom.loadChartData(fakeWindow).then((chartData) => {
      expect(chartData).toEqual([]);
      done();
    });
  });
});

describe("Testing createResult()", () => {
  let argElement, expectedElement;

  beforeEach(() => {
    spyOn(custom, "createResult").and.callThrough();
    expectedElement = document.createElement('li');
    argElement = document.createElement('div');
  });

  it("test correct creation of empty argElement", function() {
    expectedElement.innerText = '......';
    argElement.innerText = '';

    const resultElement = custom.createResult(argElement, 'l');
    expect(resultElement).toEqual(['', expectedElement]);
  });

    it("test correct creation of populated arguments", function() {
    expectedElement.innerText = '...look...';
    argElement.innerText = 'look';

    const resultElement = custom.createResult(argElement, 'l');
    expect(resultElement).toEqual(['look', expectedElement]);
  });

    it("test correct creation of empty argument query", function() {
    expectedElement.innerText = '...look...';
    argElement.innerText = 'look';

    const resultElement = custom.createResult(argElement, '');
    expect(resultElement).toEqual(['look', expectedElement]);
  });
});


describe("Testing createResult()", () => {
  let resultDiv;

  beforeEach(() => {
    spyOn(custom, "createResult").and.callThrough();
    resultDiv = custom.createSearchElement();
  });

  it("test correct creation of search element", function() {
    const searchBar = document.createElement('form');
    searchBar.className = 'form-inline';

    const expectedDiv = document.createElement('div');
    expectedDiv.className = 'md-form my-0';

    const searchInput = document.createElement('input');
    searchInput.className = 'form-control form-inline';
    searchInput.id = 'searchQuery';
    searchInput.type = 'text';
    searchInput.placeholder = 'Search';
    
    const searchResults = document.createElement('ul');
    searchResults.id = 'searchResults';
    expectedDiv.appendChild(searchInput);
    expectedDiv.appendChild(searchResults);

    expect(resultDiv).toEqual(expectedDiv);
  });

    it("test searchDiv is not created incorrectly", function() {
    const unexpectedElement = document.createElement('div');
    expect(resultDiv).not.toEqual(unexpectedElement);
  });
});

The tests in custom-script-spec.js require two dependencies I believe
  The Jasmine framework for the testing.
    npm install -g jasmine
  The JSDom library required to utilisie document calls
    npm install -g jsdom

\* TODO: remove this when typewriterFeature is removed from global scope */
You need to remove the typewriterFeature() call from the global scope
to run the tests.

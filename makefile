CLANG_FORMAT=node_modules/clang-format/bin/linux_x64/clang-format --style=Google
CSS_VALIDATOR=node_modules/css-validator/bin/css-validator
ESLINT=node_modules/eslint/bin/eslint.js
HTML_VALIDATE=node_modules/html-validate/bin/html-validate.js
PRETTIER=node_modules/prettier/bin-prettier.js

node_modules:
	npm install clang-format prettier css-validator html-validate eslint eslint-config-google

pretty: node_modules
	$(PRETTIER) --write portfolio/src/main/webapp/*.html --html-whitespace-sensitivity ignore
	$(PRETTIER) --write portfolio/src/main/webapp/css/custom.css
	find portfolio/src -iname *.java | xargs $(CLANG_FORMAT) -i
	find portfolio/src/main/webapp/js -iname *.js | xargs $(CLANG_FORMAT) -i

validate: node_modules
	$(HTML_VALIDATE) portfolio/src/main/webapp/*.html
	$(CSS_VALIDATOR) portfolio/src/main/webapp/css/custom.css
	$(ESLINT) portfolio/src/main/webapp/js/custom-script.js

package:
	mvn package

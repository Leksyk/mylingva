#!/usr/bin/env bash

# if [ -z $CLOSURE_COMPILER ]; then echo "Variable CLOSURE_COMPILER must be set"; exit 1; fi
# if [ -z $JAVA_HOME ]; then echo "Variable JAVA_HOME must be set"; exit 1; fi

# COMPILE_JS="$JAVA_HOME/bin/java -jar $CLOSURE_COMPILER --language_in=ECMASCRIPT6_STRICT --language_out=ES5_STRICT --formatting=PRETTY_PRINT --angular_pass"

rm -rf release
mkdir release
mkdir -p release/host/ui
mkdir -p release/page

#set -x
# $COMPILE_JS common/*.js host/*.js > release/host/host.js
# $COMPILE_JS common/*.js host/ui/*.js > release/host/ui/options.js
# $COMPILE_JS common/*.js page/*.js > release/page/page.js
# set +x

cp -r common release
cp -r host release
cp -r page release
cp icon.png release
cp manifest.json release

rm -rf release/**/README.md
rm -rf release/**/.gitignore

mkdir release/libs
# For production using minimized scripts.
curl -o release/libs/angular.js http://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js
curl -o release/libs/jquery.js http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js

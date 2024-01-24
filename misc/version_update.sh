#!/bin/bash
cd "$( dirname -- "$0"; )";
cd ..;

find . -name "package.json" -type f -not -path "*/node_modules/*" -exec node $( dirname -- "$0"; )/bump.js {} $1 \;

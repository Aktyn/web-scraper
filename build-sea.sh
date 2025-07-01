#!/bin/bash

# https://nodejs.org/api/single-executable-applications.html

echo "Copying bundled backend code..."
cp -r ./apps/backend/dist/standalone.js ./apps/backend/dist/standalone-copy.js
echo "... done copying bundled backend code"

echo "Adjusting backend code before SEA build..."
sed -i '1i\
const sea = require("node:sea")\
const path = require("node:path")\
const fs = require("node:fs")\
if (sea.isSea()) {\
  const libsqlNode = sea.getAsset("libsql.node")\
  const libsqlNodePath = path.join(__dirname, "libsql.node")\
  fs.writeFileSync(libsqlNodePath, Buffer.from(libsqlNode))\
\
  const sharpNode = sea.getAsset("sharp.node")\
  fs.mkdirSync(path.join(__dirname, "lib"), { recursive: true })\
  const sharpNodePath = path.join(__dirname, "lib", "sharp.node")\
  fs.writeFileSync(sharpNodePath, Buffer.from(sharpNode))\
}\
' ./apps/backend/dist/standalone-copy.js
sed -i 's/return require(`@libsql\/${target}`);/return require("node:module").createRequire(__filename)(__dirname + "\/libsql");/g' ./apps/backend/dist/standalone-copy.js
sed -i 's/sharp = require(path[0-9]*);/sharp = require("node:module").createRequire(__filename)(__dirname + "\/lib\/sharp");/g' ./apps/backend/dist/standalone-copy.js
echo "... done adjusting backend code before SEA build"

echo "Building SEA bundle..."
node --experimental-sea-config sea-config.json
echo "... done building SEA bundle"

echo "Removing copy of bundled backend code..."
rm -rf ./apps/backend/dist/standalone-copy.js
echo "... done removing copy of bundled backend code"

echo ""
echo "Preparing executable..."
mkdir -p sea
cp $(command -v node) sea/web-scraper
npx postject sea/web-scraper NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
# additional argument needed for macOS: --macho-segment-name NODE_SEA
echo "... done preparing executable"

echo ""
echo "Copying web interface..."
rm -rf ./sea/web
cp -r ./apps/web-interface/dist ./sea/web
echo "... done copying web interface"

echo ""
echo "Running executable..."
./sea/web-scraper | pino-pretty --colorize
echo "... done running executable"
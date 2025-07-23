#!/bin/bash

# https://nodejs.org/api/single-executable-applications.html

# Build for a specific target
build_target() {
  TARGET=$1
  CONFIG_FILE=$2
  POSTJECT_ARGS=$3

  EXTENSION=""
  if [ "$TARGET" == "windows" ]; then
    EXTENSION=".exe"
  fi
  if [ "$TARGET" == "darwin" ]; then
    EXTENSION=".app"
  fi

  echo ""
  echo "Building SEA bundle for $TARGET..."
  node --experimental-sea-config $CONFIG_FILE
  echo "... done building SEA bundle for $TARGET"

  echo ""
  echo "Preparing executable for $TARGET..."
  cp $(command -v node) sea/web-scraper-$TARGET$EXTENSION
  npx postject sea/web-scraper-$TARGET$EXTENSION NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 $POSTJECT_ARGS
  rm -f sea-prep.blob
  echo "... done preparing executable for $TARGET"
}

echo "Copying bundled backend code..."
cp -r ./apps/backend/dist/standalone.js ./apps/backend/dist/standalone-copy.js
echo "... done copying bundled backend code"

echo "Adjusting backend code before SEA build..."
sed -i '1i\
const sea = require("node:sea")\
const path = require("node:path")\
const fs = require("node:fs")\
const { exec } = require("node:child_process")\
if (sea.isSea()) {\
  const libsqlNode = sea.getAsset("libsql.node")\
  const libsqlNodePath = path.join(__dirname, "libsql.node")\
  fs.writeFileSync(libsqlNodePath, Buffer.from(libsqlNode))\
\
  const nodeFileDialogAsset = sea.getAsset("node-file-dialog")\
  const nodeFileDialogAssetPath = path.join(__dirname, "node-file-dialog")\
  fs.writeFileSync(nodeFileDialogAssetPath, Buffer.from(nodeFileDialogAsset))\
  exec("chmod +x " + nodeFileDialogAssetPath)\
}\
' ./apps/backend/dist/standalone-copy.js

sed -i 's/return require(`@libsql\/${target}`);/return require("node:module").createRequire(__filename)(__dirname + "\/libsql.node");/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/var cmd = path[0-9]*.join("python", "dist");/var cmd = ".";/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/.join(cmd, "linux", filename);/.join(cmd, filename);/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/\(var frontendRoot = path[0-9]*\)\.extname.*/\1.join(__dirname, "portal-frontend");/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/dep = require(name)();/dep = name === "puppeteer-extra-plugin-stealth\/evasions\/chrome.app" ? require_chrome()() : name === "puppeteer-extra-plugin-stealth\/evasions\/chrome.csi" ? require_chrome2()() : name === "puppeteer-extra-plugin-stealth\/evasions\/chrome.loadTimes" ? require_chrome3()() : name === "puppeteer-extra-plugin-stealth\/evasions\/chrome.runtime" ? require_chrome4()() : name === "puppeteer-extra-plugin-stealth\/evasions\/defaultArgs" ? require_defaultArgs()() : name === "puppeteer-extra-plugin-stealth\/evasions\/iframe.contentWindow" ? require_iframe()() : name === "puppeteer-extra-plugin-stealth\/evasions\/media.codecs" ? require_media()() : name === "puppeteer-extra-plugin-stealth\/evasions\/navigator.hardwareConcurrency" ? require_navigator()() : name === "puppeteer-extra-plugin-stealth\/evasions\/navigator.languages" ? require_navigator2()() : name === "puppeteer-extra-plugin-stealth\/evasions\/navigator.permissions" ? require_navigator3()() : name === "puppeteer-extra-plugin-stealth\/evasions\/navigator.plugins" ? require_navigator4()() : name === "puppeteer-extra-plugin-stealth\/evasions\/navigator.webdriver" ? require_navigator5()() : name === "puppeteer-extra-plugin-stealth\/evasions\/sourceurl" ? require_sourceurl()() : name === "puppeteer-extra-plugin-stealth\/evasions\/user-agent-override" ? require_user_agent_override()() : name === "puppeteer-extra-plugin-stealth\/evasions\/webgl.vendor" ? require_webgl()() : name === "puppeteer-extra-plugin-stealth\/evasions\/window.outerdimensions" ? require_window()() : name === "puppeteer-extra-plugin-user-preferences" ? require_puppeteer_extra_plugin_user_preferences()() : name === "puppeteer-extra-plugin-user-data-dir" ? require_puppeteer_extra_plugin_user_data_dir()() : require(name)();/g' ./apps/backend/dist/standalone-copy.js

echo "... done adjusting backend code before SEA build"

mkdir -p sea

# Build for all targets
build_target "linux" "sea-config-linux.json" ""
build_target "windows" "sea-config-windows.json" ""
build_target "darwin" "sea-config-darwin.json" "--macho-segment-name NODE_SEA"

echo ""
echo "Removing copy of bundled backend code..."
rm -rf ./apps/backend/dist/standalone-copy.js
echo "... done removing copy of bundled backend code"

echo ""
echo "Copying web interface..."
rm -rf ./sea/web
cp -r ./apps/web-interface/dist ./sea/web
echo "... done copying web interface"

echo ""
echo "Copying portal frontend..."
rm -rf ./sea/portal-frontend
cp -r ./node_modules/puppeteer-extra-plugin-portal/dist/frontend ./sea/portal-frontend
echo "... done copying portal frontend"

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
const { exec } = require("node:child_process")\
if (sea.isSea()) {\
  const libsqlNode = sea.getAsset("libsql.node")\
  const libsqlNodePath = path.join(__dirname, "libsql.node")\
  fs.writeFileSync(libsqlNodePath, Buffer.from(libsqlNode))\
\
  const sharpNode = sea.getAsset("sharp.node")\
  fs.mkdirSync(path.join(__dirname, "lib"), { recursive: true })\
  const sharpNodePath = path.join(__dirname, "lib", "sharp.node")\
  fs.writeFileSync(sharpNodePath, Buffer.from(sharpNode))\
\
  const nodeFileDialogAppImage = sea.getAsset("node-file-dialog-x86_64.AppImage")\
  const nodeFileDialogAppImagePath = path.join(__dirname, "node-file-dialog-x86_64.AppImage")\
  fs.writeFileSync(nodeFileDialogAppImagePath, Buffer.from(nodeFileDialogAppImage))\
  exec("chmod +x " + nodeFileDialogAppImagePath)\
}\
' ./apps/backend/dist/standalone-copy.js

sed -i 's/return require(`@libsql\/${target}`);/return require("node:module").createRequire(__filename)(__dirname + "\/libsql");/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/sharp = require(path[0-9]*);/sharp = require("node:module").createRequire(__filename)(__dirname + "\/lib\/sharp");/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/var cmd = path[0-9]*.join("python", "dist");/var cmd = ".";/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/.join(cmd, "linux", filename);/.join(cmd, filename);/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/\(var frontendRoot = path[0-9]*\)\.extname.*/\1.join(__dirname, "portal-frontend");/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/dep = require(name)();/dep = name === "puppeteer-extra-plugin-stealth\/evasions\/chrome.app" ? require_chrome()() : name === "puppeteer-extra-plugin-stealth\/evasions\/chrome.csi" ? require_chrome2()() : name === "puppeteer-extra-plugin-stealth\/evasions\/chrome.loadTimes" ? require_chrome3()() : name === "puppeteer-extra-plugin-stealth\/evasions\/chrome.runtime" ? require_chrome4()() : name === "puppeteer-extra-plugin-stealth\/evasions\/defaultArgs" ? require_defaultArgs()() : name === "puppeteer-extra-plugin-stealth\/evasions\/iframe.contentWindow" ? require_iframe()() : name === "puppeteer-extra-plugin-stealth\/evasions\/media.codecs" ? require_media()() : name === "puppeteer-extra-plugin-stealth\/evasions\/navigator.hardwareConcurrency" ? require_navigator()() : name === "puppeteer-extra-plugin-stealth\/evasions\/navigator.languages" ? require_navigator2()() : name === "puppeteer-extra-plugin-stealth\/evasions\/navigator.permissions" ? require_navigator3()() : name === "puppeteer-extra-plugin-stealth\/evasions\/navigator.plugins" ? require_navigator4()() : name === "puppeteer-extra-plugin-stealth\/evasions\/navigator.webdriver" ? require_navigator5()() : name === "puppeteer-extra-plugin-stealth\/evasions\/sourceurl" ? require_sourceurl()() : name === "puppeteer-extra-plugin-stealth\/evasions\/user-agent-override" ? require_user_agent_override()() : name === "puppeteer-extra-plugin-stealth\/evasions\/webgl.vendor" ? require_webgl()() : name === "puppeteer-extra-plugin-stealth\/evasions\/window.outerdimensions" ? require_window()() : name === "puppeteer-extra-plugin-user-preferences" ? require_puppeteer_extra_plugin_user_preferences()() : name === "puppeteer-extra-plugin-user-data-dir" ? require_puppeteer_extra_plugin_user_data_dir()() : require(name)();/g' ./apps/backend/dist/standalone-copy.js

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
echo "Copying portal frontend..."
rm -rf ./sea/portal-frontend
cp -r ./node_modules/puppeteer-extra-plugin-portal/dist/frontend ./sea/portal-frontend
echo "... done copying portal frontend"

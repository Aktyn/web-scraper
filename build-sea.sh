#!/bin/bash

# https://nodejs.org/api/single-executable-applications.html

# Build for a specific target
build_target() {
  TARGET=$1
  CONFIG_FILE=$2

  echo ""
  echo "Building SEA for $TARGET..."
  node --build-sea "$CONFIG_FILE"
  echo "... done building SEA for $TARGET"
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
  if (process.platform !== "darwin") {\
    const nodeFileDialogAsset = sea.getAsset("node-file-dialog")\
    const unpackedNodeFileDialogBinaryName = process.platform === "win32" ? "dialog.exe" : "node-file-dialog-x86_64.AppImage"\
    const nodeFileDialogAssetPath = path.join(__dirname, unpackedNodeFileDialogBinaryName)\
    fs.writeFileSync(nodeFileDialogAssetPath, Buffer.from(nodeFileDialogAsset))\
    exec("chmod +x " + nodeFileDialogAssetPath)\
  }\
}\
' ./apps/backend/dist/standalone-copy.js

sed -i 's/return require(`@libsql\/${target}`);/return require("node:module").createRequire(__filename)(__dirname + "\/libsql.node");/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/var cmd = path[0-9]*.join("python", "dist");/var cmd = ".";/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/.join(cmd, "linux", filename);/.join(cmd, filename);/g' ./apps/backend/dist/standalone-copy.js


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


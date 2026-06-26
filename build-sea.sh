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
\
  const trayBinDir = path.join(__dirname, "traybin")\
  if (!fs.existsSync(trayBinDir)) fs.mkdirSync(trayBinDir, { recursive: true })\
  const trayBinName = process.platform === "win32" ? "tray_windows_release.exe" : process.platform === "darwin" ? "tray_darwin_release" : "tray_linux_release"\
  const trayBinAsset = sea.getAsset("tray-bin")\
  const trayBinPath = path.join(trayBinDir, trayBinName)\
  fs.writeFileSync(trayBinPath, Buffer.from(trayBinAsset))\
  if (process.platform !== "win32") exec("chmod +x " + trayBinPath)\
}\
' ./apps/backend/dist/standalone-copy.js

sed -i 's/return require(`@libsql\/${target}`);/return require("node:module").createRequire(__filename)(__dirname + "\/libsql.node");/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/var cmd = path[0-9]*.join("python", "dist");/var cmd = ".";/g' ./apps/backend/dist/standalone-copy.js

sed -i 's/.join(cmd, "linux", filename);/.join(cmd, filename);/g' ./apps/backend/dist/standalone-copy.js

# Fix require.resolve calls that don't work in SEA context
# These are electron/playwright-core code paths that use require.resolve
sed -i 's|var coreDir = import_path6.default.dirname(require.resolve("../../../package.json"));|var coreDir = __dirname;|g' ./apps/backend/dist/standalone-copy.js

# Fix sizzle require.resolve - use path.join with __dirname instead
sed -i 's|(0, fs_1.readFileSync)(require.resolve("sizzle/dist/sizzle.min.js"), "utf-8")|(0, fs_1.readFileSync)(require("path").join(__dirname, "..", "..", "..", "node_modules", "sizzle", "dist", "sizzle.min.js"), "utf-8")|g' ./apps/backend/dist/standalone-copy.js

# Fix electron-related require.resolve calls (only hit in electron mode)
sed -i 's|require.resolve("./loader")|__dirname + "/loader"|g' ./apps/backend/dist/standalone-copy.js
sed -i 's|require.resolve("./chromium/appIcon.png")|require("path").join(__dirname, "chromium", "appIcon.png")|g' ./apps/backend/dist/standalone-copy.js

# Fix vite recorder require.resolve
sed -i 's|require.resolve("../../vite/recorder/" + uri)|require("path").join(__dirname, "..", "..", "vite", "recorder", uri)|g' ./apps/backend/dist/standalone-copy.js

# Fix tray binary path - in SEA, binaries are extracted to __dirname/traybin
sed -i 's|const binPath = path7.resolve(`${getDirName()}/../traybin/${binName}`);|const binPath = path7.resolve(path7.join(__dirname, "traybin", binName));|g' ./apps/backend/dist/standalone-copy.js

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


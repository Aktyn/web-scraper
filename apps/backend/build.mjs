// @ts-check

import * as esbuild from "esbuild";
import { createRequire } from "module";
import fs from "node:fs";

const require = createRequire(import.meta.url);

// This plugin is to exclude .node files from the bundle
const nativeNodeModulesPlugin = {
  name: 'native-node-modules',
  setup(build) {
    build.onResolve({ filter: /\.node$/, namespace: 'file' }, (args) => {
      return ({
        path: require.resolve(args.path, { paths: [args.resolveDir] }),
        external: true,
      })
    });
  },
};

const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));

const entryPoints = ["src/main.ts"];

const external = [
  ...Object.keys(pkg.devDependencies || {}),
];

const outfile = "dist/standalone.js";

await esbuild.build({
  entryPoints,
  bundle: true,
  platform: "node",
  target: "node23",
  format: "cjs",
  outfile,
  external,
  logLevel: "info",
  plugins: [nativeNodeModulesPlugin],
});

fs.writeFileSync(
  outfile,
  fixCode(fs.readFileSync(outfile, "utf-8")),
);

fs.cpSync("../../node_modules/@libsql", "./dist/node_modules/@libsql", {
  recursive: true,
});

/** @param {string} code */
function fixCode(code) {
  return code.replace(
    /var __filename\d+ = import_node_url\.default\.fileURLToPath\(import_meta\d+\.url\);\s*var __dirname\d+ = import_node_path\d+\.default\.dirname\(__filename\d+\);\s*var (require\d+) = import_node_module\d+\.default\.createRequire\(import_meta\d+\.url\);/g,
    'var $1 = () => ({version: "2.0.0"})',
  ).replace(/return \(\) =\> __dirname\d;/g, "return () => __dirname;")
    .replace(/require\("kind-of", "typeOf"\);/g, 'utils2.typeOf = require_kind_of();')
    .replace(/require\("is-plain-object", "isObject"\);/g, 'utils2.isObject = require_is_plain_object().isPlainObject;')
    .replace(/require\("shallow-clone", "clone"\);/g, 'utils2.clone = require_shallow_clone();')
    .replace(/require_for_own\(\);/g, 'utils2.forOwn = require_for_own();');
}
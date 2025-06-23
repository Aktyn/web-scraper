import * as esbuild from "esbuild";
import { readFile, cp } from "fs/promises";
import { createRequire } from "module";

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

const pkg = JSON.parse(await readFile("package.json", "utf-8"));

const entryPoints = ["src/main.ts"];

const external = [
  ...Object.keys(pkg.devDependencies || {}),
];

await esbuild.build({
  entryPoints,
  bundle: true,
  platform: "node",
  target: "node23",
  format: "cjs",
  outfile: "dist/standalone.js",
  external,
  logLevel: "info",
  plugins: [nativeNodeModulesPlugin],
});

await cp("../../node_modules/@libsql", "./dist/node_modules/@libsql", {
  recursive: true,
}); 
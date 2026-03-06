const {build} = require("esbuild");
const esbuildBabelPlugin = require("esbuild-babel-plugin");
const path = require("path");
const fs = require("fs/promises");
const os = require("node:os");

async function transformWithESBuild(inputCode, filename = `test-${crypto.randomUUID()}.js`) {
  const tmpFile = path.join(os.tmpdir(), filename);
  await fs.mkdir(path.dirname(tmpFile), {recursive: true});
  await fs.writeFile(tmpFile, inputCode);
  try {
    const result = await build({
      entryPoints: [tmpFile],
      bundle: false,
      write: false,
      plugins: [
        esbuildBabelPlugin({
          filter: /\.(jsx?|tsx?)$/,
          plugins: [
            require("../index")
          ]
        })
      ],
      sourcemap: true
    });
    return result.outputFiles[0].text;
  } finally {
    await fs.unlink(tmpFile).catch(console.log);
  }
}

function normalize(code) {
  return stripMap(code).split("\n").map(line => line.trim()).join("\n").trim();
}

function stripMap(code) {
  const idx = code.lastIndexOf("//# sourceMappingURL");
  return idx === -1 ? code : code.slice(0, idx);
}

function transformWithBabel(code, filename) {
  const result = require("@babel/core").transformSync(code, {
    filename,
    plugins: [require("../index")],
    sourceType: "module"
  });
  return result.code;
}

module.exports = {
  normalize,
  transformWithESBuild: transformWithESBuild,
  transformWithBabel
};
const {build} = require("esbuild");
const esbuildBabelPlugin = require("esbuild-babel-plugin");
const path = require("path");
const fs = require("fs/promises");
const os = require("node:os");

async function transform(inputCode, filename = `test-${crypto.randomUUID()}.js`) {
  const tmpFile = path.join(os.tmpdir(), filename);
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
  return code.slice(0, code.lastIndexOf("//# sourceMappingURL"));
}

module.exports = {
  normalize,
  transform
};
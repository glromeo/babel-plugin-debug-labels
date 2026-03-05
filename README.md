# babel-plugin-debug-labels

A Babel plugin to automatically assign the variable identifiers to signals or atoms debugLabels.

## Installation

```bash
npm install --save-dev babel-plugin-debug-labels
```

or

```bash
yarn add -D babel-plugin-debug-labels
```

## Usage

Add the plugin to your Babel configuration:

**.babelrc**

```json
{
  "plugins": ["babel-plugin-debug-labels"]
}
```

**babel.config.js**

```javascript
module.exports = {
  plugins: ['babel-plugin-debug-labels']
}
```

## Programmatic usage with options

```javascript
const babel = require("@babel/core");
const plugin = require("babel-plugin-debug-labels");

const result = babel.transformSync(code, {
  plugins: [
    [
      plugin, 
      {
        accept: (name) => name === "store" || name === "signal",
        debugProperty: "debugLabel"
      }
    ]
  ]
});
```

- **`accept`** `(name: string) => boolean` — determines which call expressions are treated as signal/atom constructors. Defaults to matching `atom`, `signal`, `computed`, and `effect`.
- **`debugProperty`** `string` — the property name assigned on the variable. Defaults to `"debugLabel"`.

## What it does

The plugin automatically detects signals (or atoms) creation (like `signal(...)` or `computed(() => ...)`) preceeded by
a variable declaration.
When it finds one it injects a statement that assigns the variable name to the debugLabel property of that signal.

```
    export const alpha = signal(0);
```

becomes

```
    export const alpha = signal(0);
    alpha.debugLabel = "alpha";
```

## What it doesn't intercept

inline signals for which the debug label can not be determined

## Use Cases

This plugin is particularly useful when:

- Building debug tools for signals libraries

## Requirements

- `@babel/core`: ^7.24.0 or higher
- `@babel/types`: ^7.24.1 or higher
- `esbuild-babel-plugin`: ^0.4.0 or higher (for esbuild integration)

## TypeScript Support

The plugin automatically enables TypeScript parsing, so you can use it with `.tsx` files without additional
configuration.

## Integration with esbuild

This plugin works seamlessly with esbuild via `esbuild-babel-plugin`:

```javascript
const { build } = require("esbuild");
const esbuildBabelPlugin = require("esbuild-babel-plugin");

build({
  entryPoints: ["src/index.jsx"],
  bundle: true,
  jsx: "automatic",
  jsxImportSource: "preact",
  plugins: [
    esbuildBabelPlugin({
      filter: /\.(jsx|tsx)$/,
      plugins: ["babel-plugin-debug-labels"]
    })
  ]
});
```

The `plugins` array follows standard Babel plugin convention. The `babel-plugin-` prefix is optional, and options can be passed using a tuple:

```javascript
plugins: [["debug-labels", { debugProperty: "debugInfo" }]]
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

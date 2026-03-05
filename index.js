const {basename, dirname, extname} = require("path");

/**
 * Babel plugin debug labels
 *
 * @param babel {{types: import("@babel/types")}}
 * @param options {any}
 * @returns {import("@babel/core").PluginObj}
 */
module.exports = function pluginDebugLabels({types}, {
  accept = name => name === "atom" || name === "signal" || name === "computed" || name === "effect",
  debugProperty = "debugLabel"
} = {}) {
  const {
          identifier, isCallExpression, isIdentifier, isMemberExpression, expressionStatement, assignmentExpression,
          memberExpression, stringLiteral, variableDeclarator, variableDeclaration, exportDefaultDeclaration
        } = types;

  const hasDebugLabel = (callee) => isIdentifier(callee) && accept(callee.name) || isMemberExpression(callee) && isIdentifier(callee.property) && accept(callee.property.name);

  function getExpressionStatement(varName, displayName) {
    return expressionStatement(assignmentExpression("=", memberExpression(identifier(varName), identifier(debugProperty)), stringLiteral(displayName)));
  }

  return {
    name: "plugin-debug-labels",
    pre() {
      // Fresh set per file: tracks declarators created by ExportDefaultDeclaration
      // so VariableDeclarator does not add a second debugLabel assignment for them.
      this.processed = new WeakSet();
    },
    visitor: {
      ExportDefaultDeclaration(path, state) {
        const {node} = path;
        if (!(
          !isCallExpression(node.declaration) || !hasDebugLabel(node.declaration.callee)
        )) {
          const filename = state.filename || "unknown";
          let displayName = basename(filename, extname(filename));
          if (displayName === "index") {
            displayName = dirname(filename) || "unknown";
          }
          const varName = displayName.replace(/-/g, "_");
          const declarator = variableDeclarator(identifier(varName), node.declaration);
          state.processed.add(declarator);
          path.replaceWithMultiple([
            variableDeclaration("const", [declarator]),
            getExpressionStatement(varName, displayName),
            exportDefaultDeclaration(identifier(varName))
          ]);
        }
      },
      VariableDeclarator(path, state) {
        if (!state.processed.has(path.node)) {
          if (isIdentifier(path.node.id) && isCallExpression(path.node.init) && hasDebugLabel(path.node.init.callee)) {
            path.parentPath.insertAfter(getExpressionStatement(path.node.id.name, path.node.id.name));
          }
        }
      }
    }
  };
};

const {basename, dirname, extname} = require("path");

/**
 * Babel plugin debug labels
 *
 * @param babel {{types: import("@babel/types")}}
 * @param options {{ accept?: (name: string) => boolean, property?: string }}
 * @returns {import("@babel/core").PluginObj}
 */
module.exports = function pluginDebugLabels(
    {types},
    {
        accept = name => name === "atom" || name === "signal" || name === "computed" || name === "effect",
        property = "debugLabel"
    } = {}
) {
    const {
              identifier,
              isCallExpression,
              isIdentifier,
              isMemberExpression,
              expressionStatement,
              assignmentExpression,
              memberExpression,
              stringLiteral,
              variableDeclarator,
              variableDeclaration,
              exportDefaultDeclaration
          } = types;

    const hasDebugLabel = (callee) => isIdentifier(callee) && accept(callee.name)
        || isMemberExpression(callee) && isIdentifier(callee.property) && accept(callee.property.name);

    const getExpressionStatement = (varName, displayName) => expressionStatement(
        assignmentExpression(
            "=",
            memberExpression(identifier(varName), identifier(property)),
            stringLiteral(displayName)
        )
    );

    return {
        name: "plugin-debug-labels",
        pre() {
            // Fresh set per file: tracks declarators created by ExportDefaultDeclaration
            // so VariableDeclarator does not add a second debugLabel assignment for them.
            this.processed = new WeakSet();
        },
        visitor: {
            ExportDefaultDeclaration(path, state) {
                const {declaration} = path.node;
                if (!(
                    !isCallExpression(declaration) || !hasDebugLabel(declaration.callee)
                )) {
                    const filename = state.filename || "unknown";
                    let displayName = basename(filename, extname(filename));
                    if (displayName === "index") {
                        displayName = basename(dirname(filename)) || "unknown";
                    }
                    const varName = displayName.replace(/-/g, "_");
                    const declarator = variableDeclarator(identifier(varName), declaration);
                    state.processed.add(declarator);
                    path.replaceWithMultiple([
                        variableDeclaration("const", [declarator]),
                        getExpressionStatement(varName, displayName),
                        exportDefaultDeclaration(identifier(varName))
                    ]);
                }
            },
            VariableDeclarator({node, parentPath}, state) {
                if (!state.processed.has(node)) {
                    const {id, init} = node;
                    if (isIdentifier(id) && isCallExpression(init) && hasDebugLabel(init.callee)) {
                        parentPath.insertAfter(getExpressionStatement(id.name, id.name));
                    }
                }
            }
        }
    };
};

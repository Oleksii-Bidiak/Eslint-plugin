/**
 * @fileoverview feature sliced relative path checker
 * @author oleksii
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const path = require("path");

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    messages: {
      someMessageId: "Within one slice, all imports must be relative",
    },
    type: "layout", // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        // example app/entities/Article
        const importTo = node.source.value;

        // example C:\Users\tim\Desktop\javascript\production_project\src\entities\Article
        const fromFilename = context.getFilename();

        if (shouldBeRelative(fromFilename, importTo)) {
          context.report({ node, messageId: "someMessageId" });
        }
      },
    };
  },
};

function isPathRelative(path) {
  return path === "." || path.startsWith("./") || path.startsWith("../");
}

const layers = {
  entities: "entities",
  features: "features",
  shared: "shared",
  pages: "pages",
  widgets: "widgets",
};

function shouldBeRelative(from, to) {
  if (isPathRelative(to)) {
    return false;
  }

  // example entities/Article
  const toArray = to.split("/");
  const toLayer = toArray[0]; // entities
  const toSlice = toArray[1]; // Article

  if (!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  const normalizedPath = path.toNamespacedPath(from);
  const projectFrom = normalizedPath.split("src")[1];
  const fromArray = projectFrom.split("\\");

  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if (!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
}

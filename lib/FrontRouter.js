const fs = require('fs');
const path = require('path');
const Libraries = require('../libraries');

module.exports = class FrontRouter {
  constructor(opts = {}) {
    this.options = {
      pageRoot: opts.pageRoot || process.cwd()
    }
    this.routes = [];

    // Figure out what library to load
    switch (typeof opts.library) {
      // String: pull a library out of the built-in ones
      case 'string': {
        const lib = Libraries[opts.library];
        if (typeof lib === 'undefined') {
          throw new Error(`Front Router: there's no built-in plugin for "${opts.library}"`);
        }
        else {
          this.options.library = lib;
        }
        break;
      }
      // Function: add as-is
      case 'function': {
        this.options.library = opts.library;
        break;
      }
      // Nothing: use the default library adapter
      case 'undefined': {
        this.options.library = Libraries.default;
        break;
      }
      // Other weird values? Nope
      default: {
        throw new Error('Front Router: library must be a string or function.');
      }
    }
  }

  addRoute(route) {
    if (typeof route !== 'object' || route === null) {
      throw new Error('Front Router: routes must be objects.');
    }
    this.routes.push(Object.assign({}, route, {
      path: path.relative(this.options.pageRoot, route.path)
    }));
  }

  writeRoutes(filePath) {
    const routes = this.routes.sort(function(a, b) {
      return a.url < b.url;
    });

    const contents = this.options.library(routes);

    return new Promise((resolve, reject) => {
      fs.appendFile(filePath, contents, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

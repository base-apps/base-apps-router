const fs = require('fs');
const path = require('path');
const Libraries = require('./libraries');

/**
 * Options that can be passed to the `FrontRouter` class.
 * @typedef {Object} FrontRouterOptions
 * @prop {String} pageRoot - Root path to HTML files.
 * @prop {String|Function} library - Library to print routes for. Can be a string pointing to a built-in library adapter, or a function for a custom adapter.
 */

/**
 * Class to manage routes and write them to disk as a routes file.
 */
module.exports = class FrontRouter {
  /**
   * Creates a new instance of `FrontRouter`.
   * @prop {FrontRouterOptions} opts - Class options.
   */
  constructor(opts = {}) {
    this.options = {
      pageRoot: opts.pageRoot || process.cwd(),
      overwrite: opts.overwrite || false
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

  /**
   * Add a new route.
   * @param {Object} route - Route to add.
   */
  addRoute(route) {
    if (typeof route !== 'object' || route === null) {
      throw new Error('Front Router: routes must be objects.');
    }
    this.routes.push(Object.assign({}, route, {
      path: path.relative(this.options.pageRoot, route.path)
    }));
  }

  /**
   * Write all routes to disk as a JavaScript file, using the set library adapter.
   * @param {String} filePath - Path to write to.
   * @returns {Promise} Promise which resolves when the file has been written, or rejects if there's an error.
   */
  writeRoutes(filePath) {
    const routes = this.routes.sort(function(a, b) {
      return a.url < b.url;
    });

    const contents = this.options.library(routes);
    const overwrite = this.options.overwrite;

    return new Promise((resolve, reject) => {
      if (overwrite) {
        fs.writeFile(filePath, contents, err => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        fs.appendFile(filePath, contents, err => {
          if (err) reject(err);
          else resolve();
        });
      }
    });
  }
}

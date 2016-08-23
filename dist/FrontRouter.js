'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
var Libraries = require('./libraries');

/**
 * Options that can be passed to the `FrontRouter` class.
 * @typedef {Object} FrontRouterOptions
 * @prop {String} pageRoot - Root path to HTML files.
 * @prop {String|Function} library - Library to print routes for. Can be a string pointing to a built-in library adapter, or a function for a custom adapter.
 */

/**
 * Class to manage routes and write them to disk as a routes file.
 */
module.exports = function () {
  /**
   * Creates a new instance of `FrontRouter`.
   * @prop {FrontRouterOptions} opts - Class options.
   */
  function FrontRouter() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, FrontRouter);

    this.options = {
      pageRoot: opts.pageRoot || process.cwd()
    };
    this.routes = [];

    // Figure out what library to load
    switch (_typeof(opts.library)) {
      // String: pull a library out of the built-in ones
      case 'string':
        {
          var lib = Libraries[opts.library];
          if (typeof lib === 'undefined') {
            throw new Error('Front Router: there\'s no built-in plugin for "' + opts.library + '"');
          } else {
            this.options.library = lib;
          }
          break;
        }
      // Function: add as-is
      case 'function':
        {
          this.options.library = opts.library;
          break;
        }
      // Nothing: use the default library adapter
      case 'undefined':
        {
          this.options.library = Libraries.default;
          break;
        }
      // Other weird values? Nope
      default:
        {
          throw new Error('Front Router: library must be a string or function.');
        }
    }
  }

  /**
   * Add a new route.
   * @param {Object} route - Route to add.
   */


  _createClass(FrontRouter, [{
    key: 'addRoute',
    value: function addRoute(route) {
      if ((typeof route === 'undefined' ? 'undefined' : _typeof(route)) !== 'object' || route === null) {
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

  }, {
    key: 'writeRoutes',
    value: function writeRoutes(filePath) {
      var routes = this.routes.sort(function (a, b) {
        return a.url < b.url;
      });

      var contents = this.options.library(routes);

      return new Promise(function (resolve, reject) {
        fs.appendFile(filePath, contents, function (err) {
          if (err) reject(err);else resolve();
        });
      });
    }
  }]);

  return FrontRouter;
}();
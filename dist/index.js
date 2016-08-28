'use strict';

var fm = require('front-matter');
var FrontRouter = require('./FrontRouter');
var hybrid = require('hybrid-gulp');

var _require = require('gulp-util');

var PluginError = _require.PluginError;

/**
 * Options object passed to the `frontRouter()` function.
 * @typedef {Object} PluginOptions
 * @prop {String} src - Glob of HTML files to parse. Not used in a Gulp context.
 * @prop {String} dest - Folder to output HTML files to. Not used in a Gulp context.
 * @prop {String} root - Common path to source HTML files.
 * @prop {String} path - File path for JavaScript routes file.
 * @prop {String} overwrite - Whether or not to overwrite the routes file (appends by default).
 * @prop {String} library - Library to format routes file for.
 */

/**
 * Processes a set of HTML files, analyzing them for routes and producing a JavaScript routes file.
 * @param {PluginOptions} opts - Plugin options.
 * @returns Plugin instance with user-supplied options passed in.
 */

module.exports = function (opts) {
  var router = new FrontRouter({
    library: opts.library,
    pageRoot: opts.root,
    overwrite: opts.overwrite
  });

  return hybrid({
    /**
     * Pulls the Front Matter from an HTML file, adds it to the route list, and returns a modified file without the Front Matter.
     * @prop {File} file - Vinyl file.
     * @prop {String} enc - File encoding.
     * @prop {Function} cb - Callback to return modified file or errors.
     * @prop {PluginOptions} opts - Plugin options.
     */
    transform: function transform(file, enc, cb, opts) {
      if (file.isNull()) {
        cb(null, file);
      }

      if (file.isStream()) {
        cb(new PluginError('base-apps-router', 'Streams not supported.'));
      }

      if (file.isBuffer()) {
        var frontMatter = fm(file.contents.toString());
        if (frontMatter.frontmatter) {
          frontMatter.attributes.path = file.path;
          router.addRoute(frontMatter.attributes);
          file.contents = new Buffer(frontMatter.body);
        }
        cb(null, file);
      }
    },
    /**
     * Writes routes to a JavaScript file. Runs after all files have been processed.
     * @param {PluginOptions} opts - Plugin options.
     * @param {Function} cb - Callback to run when routes have been written.
     */
    onFinish: function onFinish(opts, cb) {
      router.writeRoutes(opts.path).then(cb);
    }
  })(opts);
};
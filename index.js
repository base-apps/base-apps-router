const fm = require('front-matter');
const FrontRouter = require('./lib/FrontRouter');
const hybrid = require('hybrid-gulp');
const PluginError = require('gulp-util').PluginError;

/**
 * Options object passed to the `frontRouter()` function.
 * @typedef {Object} PluginOptions
 * @prop {String} src - Glob of HTML files to parse. Not used in a Gulp context.
 * @prop {String} dest - Folder to output HTML files to. Not used in a Gulp context.
 * @prop {String} root - Common path to source HTML files.
 * @prop {String} output - File path for JavaScript routes file.
 * @prop {String} library - Library to format routes file for.
 */

/**
 * Processes a set of HTML files, analyzing them for routes and producing a JavaScript routes file.
 * @param {PluginOptions} opts - Plugin options.
 * @returns Plugin instance with user-supplied options passed in.
 */
module.exports = opts => {
  const router = new FrontRouter({
    library: opts.library,
    pageRoot: opts.root
  });

  return hybrid({
    /**
     * Pulls the Front Matter from an HTML file, adds it to the route list, and returns a modified file without the Front Matter.
     * @prop {File} file - Vinyl file.
     * @prop {String} enc - File encoding.
     * @prop {Function} cb - Callback to return modified file or errors.
     * @prop {PluginOptions} opts - Plugin options.
     */
    transform: (file, enc, cb, opts) => {
      if (file.isNull()) {
        cb(null, file);
      }

      if (file.isStream()) {
        cb(new PluginError('angular-front-router', 'Streams not supported.'));
      }

      if (file.isBuffer()) {
        const frontMatter = fm(file.contents.toString());
        frontMatter.attributes.path = file.path;
        router.addRoute(frontMatter.attributes);
        file.contents = new Buffer(frontMatter.body);
        cb(null, file);
      }
    },
    /**
     * Writes routes to a JavaScript file. Runs after all files have been processed.
     * @param {PluginOptions} opts - Plugin options.
     * @param {Function} cb - Callback to run when routes have been written.
     */
    onFinish: (opts, cb) => {
      router.writeRoutes(opts.path).then(cb);
    }
  })(opts);
}

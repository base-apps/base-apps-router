const fs = require('fs');
const path = require('path');

const Libraries = {
  ANGULAR: 'angular'
}

module.exports.Libraries = Libraries;

module.exports = class FrontRouter {
  constructor(opts) {
    this.options = Object.assign({
      library: Libraries.ANGULAR,
      pageRoot: process.cwd()
    }, opts);
    this.routes = [];
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

    const contents = FrontRouter.makeOutputString(routes);

    return new Promise((resolve, reject) => {
      fs.appendFile(filePath, contents, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static makeOutputString(routes) {
    return `var routes = ${JSON.stringify(routes)}`;
  }
}

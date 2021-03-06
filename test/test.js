const FrontRouter = require('../dist/FrontRouter');
const frontRouter = require('../dist');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const tempfile = require('tempfile');
const vfs = require('vinyl-fs');
const { expect } = require('chai');

describe('FrontRouter', () => {
  const route = {
    name: 'home',
    url: '/',
    path: path.join(process.cwd(), '/src/home.html')
  }

  describe('constructor()', () => {
    it('creates a new instance of FrontRouter', () => {
      const fr = new FrontRouter();
      expect(fr).to.be.an.instanceOf(FrontRouter);
    });

    it('sets default options', () => {
      const fr = new FrontRouter();
      expect(fr).to.have.property('options').with.keys(['library', 'pageRoot', 'overwrite']);
    });

    it('sets empty routes array', () => {
      const fr = new FrontRouter();
      expect(fr).to.have.property('routes').which.is.empty;
    });
  });

  describe('addRoute()', () => {
    it('adds a new route', () => {
      const fr = new FrontRouter();
      const expected = Object.assign({}, route, { path: 'src/home.html' });

      fr.addRoute(route);
      expect(fr.routes).to.eql([expected]);
    });

    it('adjusts for root path option', () => {
      const pageRoot = path.join(process.cwd(), 'src');
      const fr = new FrontRouter({ pageRoot: pageRoot });
      const expected = Object.assign({}, route, { path: 'home.html' });

      fr.addRoute(route);
      expect(fr.routes).to.eql([expected]);
    });

    it('throws an error if input is not an object', () => {
      const fr = new FrontRouter();
      expect(() => fr.addRoute('nope')).to.throw(Error);
    });

    it('throws an error if input is null', () => {
      const fr = new FrontRouter();
      expect(() => fr.addRoute(null)).to.throw(Error);
    });
  });

  describe('writeRoutes()', () => {
    it('returns a promise', () => {
      const fr = new FrontRouter();
      const write = fr.writeRoutes(tempfile('.js'));
      expect(write).to.be.an.instanceOf(Promise);
    });

    it('writes routes to a file', () => {
      const fr = new FrontRouter();
      const filePath = tempfile('.js');
      const onRead = (err, data) => expect(data.toString()).to.contain('var BaseAppsRoutes = []');

      fr.writeRoutes(filePath).then(() => fs.readFile(filePath, onRead));
    });

    it('appends routes to a file', () => {
      const fr = new FrontRouter();
      const filePath = tempfile('.js');
      const onRead = (err, data) => expect(data.toString()).to.match(/\s*var BaseAppsRoutes = \[\]\;\s*var BaseAppsRoutes = \[\]\;\s*/);

      fr.writeRoutes(filePath).then(() => {
        fr.writeRoutes(filePath).then(() => {
          fs.readFile(filePath, onRead);
        });
      });
    });

    it('overwrites routes to a file', () => {
      const fr = new FrontRouter({ overwrite: true });
      const filePath = tempfile('.js');
      const onRead = (err, data) => expect(data.toString()).to.not.match(/\s*var BaseAppsRoutes = \[\]\;\s*var BaseAppsRoutes = \[\]\;\s*/);

      fr.writeRoutes(filePath).then(() => {
        fr.writeRoutes(filePath).then(() => {
          fs.readFile(filePath, onRead);
        });
      });
    });

    it('writes an angular adapter', () => {
      const fr = new FrontRouter({ library: 'angular' });
      const filePath = tempfile('.js');
      const onRead = (err, data) => expect(data.toString()).to.contain('angular.module');

      fr.writeRoutes(filePath).then(() => fs.readFile(filePath, onRead));
    });

    it('writes a node adapater', () => {
      const fr = new FrontRouter({ library: 'node' });
      const filePath = tempfile('.js');
      const onRead = (err, data) => expect(data.toString()).to.contain('module.exports');

      fr.writeRoutes(filePath).then(() => fs.readFile(filePath, onRead));
    });
  });
});

describe('front-router API', () => {
  const home = './test/fixtures/home.html';
  const parent = './test/fixtures/parent.html';
  const partial = './test/fixtures/partial.html';
  const output = './test/fixtures/_build';
  const pageRoot = './test/fixtures';

  afterEach(done => {
    rimraf(output, done);
  });

  it('works standalone', done => {
    frontRouter({
      src: home,
      dest: output,
      root: pageRoot,
      path: path.join(output, 'routes.js')
    }).then(() => checkFiles('home', done)).catch(done);
  });

  it('works standalone without HTML output', done => {
    frontRouter({
      src: home,
      root: pageRoot,
      path: path.join(output, 'routes.js')
    }).then(() => checkNoFiles('home', done)).catch(done);
  });

  it('works as a gulp plugin', done => {
    vfs.src(home)
      .pipe(frontRouter({
        root: pageRoot,
        path: path.join(output, 'routes.js')
      }))
      .pipe(vfs.dest(output))
      .on('finish', (err) => {
        if (err) throw err;
        checkFiles('home', done);
      });
  });

  it('works for appending routes', done => {
    frontRouter({
      src: home,
      dest: output,
      root: pageRoot,
      path: path.join(output, 'routes.js')
    }).then(() => {
      frontRouter({
        src: parent,
        dest: output,
        root: pageRoot,
        path: path.join(output, 'routes.js')
      }).then(() => {
        checkFiles('home', () => {
          checkFiles('parent', done);
        });
      }).catch(done);
    }).catch(done);
  });

  it('works for overwriting routes', done => {
    frontRouter({
      src: home,
      dest: output,
      root: pageRoot,
      path: path.join(output, 'routes.js')
    }).then(() => {
      frontRouter({
        src: parent,
        dest: output,
        root: pageRoot,
        path: path.join(output, 'routes.js'),
        overwrite: true
      }).then(() => {
        checkHomeFiles(() => {
          checkFiles('parent', done);
        }, false);
      }).catch(done);
    }).catch(done);
  });

  it('works for html files without front matter', done => {
    frontRouter({
      src: partial,
      dest: output,
      root: pageRoot,
      path: path.join(output, 'routes.js')
    }).then(() => checkFiles('partial', done)).catch(done);
  });

  /**
   * Verify that HTML files passed through the plugin had their Front Matter stripped, and that a routes JavaScript file was created.
   * @param {Function} cb - Callback for Mocha.
   */
   function checkFiles(name, cb) {
     switch (name) {
       case 'home':
         checkHomeFiles(cb, true); break;
       case 'parent':
         checkParentFiles(cb, true); break;
       case 'partial':
         checkPartialFiles(cb); break;
       default:
         cb(); break;
     }
   }

   function checkNoFiles(name, cb) {
     fs.stat(path.join(output, name + '.html'), function(err, data) {
       expect(err).to.be.defined;
       cb();
     });
   }

   function checkHomeFiles(cb, inRoutes) {
     const expected = {
       name: 'home',
       url: '/',
       path: 'home.html'
     }

     const pageFile = fs.readFileSync(path.join(output, 'home.html'));
     const routesFile = fs.readFileSync(path.join(output, 'routes.js'));

     expect(pageFile.toString()).to.not.contain('---');

     if (inRoutes) {
       expect(routesFile.toString()).to.contain(JSON.stringify(expected));
     } else {
       expect(routesFile.toString()).to.not.contain(JSON.stringify(expected));
     }

     cb();
   }

   function checkParentFiles(cb, inRoutes) {
     const expected = {
       name: 'parent',
       url: '/parent',
       path: 'parent.html'
     }

     const pageFile = fs.readFileSync(path.join(output, 'parent.html'));
     const routesFile = fs.readFileSync(path.join(output, 'routes.js'));

     expect(pageFile.toString()).to.not.contain('---');

     if (inRoutes) {
       expect(routesFile.toString()).to.contain(JSON.stringify(expected));
     } else {
       expect(routesFile.toString()).to.not.contain(JSON.stringify(expected));
     }

     cb();
   }

   function checkPartialFiles(cb) {
     const invalidroute = {
       path: 'partial.html'
     }

     const pageFile = fs.readFileSync(path.join(output, 'partial.html'));
     const routesFile = fs.readFileSync(path.join(output, 'routes.js'));

     expect(pageFile.toString()).to.not.contain('---');
     expect(routesFile.toString()).to.not.contain(JSON.stringify(invalidroute));

     cb();
   }
});

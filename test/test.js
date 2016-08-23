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
      expect(fr).to.have.property('options').with.keys(['library', 'pageRoot']);
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

    it('writes an alternate library adapter', () => {
      const fr = new FrontRouter({ library: 'angular' });
      const filePath = tempfile('.js');
      const onRead = (err, data) => expect(data.toString()).to.contain('angular.module');

      fr.writeRoutes(filePath).then(() => fs.readFile(filePath, onRead));
    });
  });
});

describe('front-router API', () => {
  const input = './test/fixtures/home.html';
  const output = './test/fixtures/_build';
  const pageRoot = './test/fixtures';

  afterEach(done => {
    rimraf(output, done);
  });

  it('works standalone', done => {
    frontRouter({
      src: input,
      dest: output,
      root: pageRoot,
      path: path.join(output, 'routes.js')
    }).then(() => checkFiles(done)).catch(done);
  });

  it('works as a gulp plugin', done => {
    vfs.src(input)
      .pipe(frontRouter({
        root: pageRoot,
        path: path.join(output, 'routes.js')
      }))
      .pipe(vfs.dest(output))
      .on('finish', (err) => {
        if (err) throw err;
        checkFiles(done);
      });
  });

  /**
   * Verify that HTML files passed through the plugin had their Front Matter stripped, and that a routes JavaScript file was created.
   * @param {Function} cb - Callback for Mocha.
   */
  function checkFiles(cb) {
    const expected = {
      name: 'home',
      url: '/',
      path: 'home.html'
    }

    const pageFile = fs.readFileSync(path.join(output, 'home.html'));
    const routesFile = fs.readFileSync(path.join(output, 'routes.js'));

    expect(pageFile.toString()).to.not.contain('---');
    expect(routesFile.toString()).to.contain(JSON.stringify(expected));

    cb();
  }
});

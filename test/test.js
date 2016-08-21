const FrontRouter = require('../lib/FrontRouter');
const path = require('path');
const tempfile = require('tempfile');
const { Libraries } = FrontRouter;
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
      const onRead = (err, data) => expect(data).to.contain('var routes = []');

      fr.writeRoutes(filePath).then(() => fs.readFile(filePath, onRead));
    });
  });

  describe('makeOutputString()', () => {
    it('converts routes to a JavaScript variable declaration', () => {
      const fr = new FrontRouter();
      const filePath = tempfile('.js');
      const expected = Object.assign({}, route, { path: 'src/home.html' });
      fr.addRoute(route);
      const output = FrontRouter.makeOutputString(fr.routes);

      expect(output).to.contain(JSON.stringify(fr.routes));
    });
  });
});

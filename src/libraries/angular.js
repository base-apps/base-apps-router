module.exports = (routes) => {
  return `
  angular.module('foundation.dynamicRouting').config([
    '$FoundationStateProvider',
    function(FoundationStateProvider) {
      FoundationStateProvider.registerDynamicRoutes(${JSON.stringify(routes)});
    }
  ]);
  `
}

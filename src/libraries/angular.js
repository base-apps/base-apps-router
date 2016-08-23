module.exports = (routes) => {
  return `
  angular.module('dynamicRouting').config([
    '$BaseAppsStateProvider',
    function(BaseAppsStateProvider) {
      BaseAppsStateProvider.registerDynamicRoutes(${JSON.stringify(routes)});
    }
  ]);
  `
}

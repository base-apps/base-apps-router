"use strict";

module.exports = function (routes) {
  return "\n  angular.module('dynamicRouting').config([\n    '$BaseAppsStateProvider',\n    function(BaseAppsStateProvider) {\n      BaseAppsStateProvider.registerDynamicRoutes(" + JSON.stringify(routes) + ");\n    }\n  ]);\n  ";
};
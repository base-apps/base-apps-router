"use strict";

module.exports = function (routes) {
  return "\n  var BaseAppsRoutes = " + JSON.stringify(routes) + ";\n  ";
};
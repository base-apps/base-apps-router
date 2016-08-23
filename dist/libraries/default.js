"use strict";

module.exports = function (routes) {
  return "var BaseAppsRoutes = " + JSON.stringify(routes);
};
"use strict";

module.exports = function (routes) {
  return "\n  module.exports = " + JSON.stringify(routes) + ";\n  ";
};
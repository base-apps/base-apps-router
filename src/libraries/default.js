module.exports = (routes) => {
  return `var BaseAppsRoutes = ${JSON.stringify(routes)}`;
}

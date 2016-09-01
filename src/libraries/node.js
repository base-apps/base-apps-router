module.exports = (routes) => {
  return `
  module.exports = ${JSON.stringify(routes)};
  `;
}

module.exports = {
  // Jest runs files:
  // - in __tests__ folder
  // - with .test.js suffix
  // - with .spec.js suffix
  // To avoid the projects spec.js file to falsely be considered a test file
  // exclude it specifically.
  testPathIgnorePatterns: ['/node_modules/', '/dependencies/', 'spec.js']
};

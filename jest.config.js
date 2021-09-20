/** @see https://jestjs.io/docs/en/configuration */
module.exports = {
    automock: false,
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    resetModules: true,
    restoreMocks: true,
    testEnvironment: 'node',
    verbose: true,
    roots: [
        "<rootDir>/src",
        "<rootDir>/test"
    ],
    transform: {
      '^.+\\.(ts|tsx)?$': 'ts-jest',
      "^.+\\.(js|jsx)$": 'babel-jest'
    },
    testRegex: "^.+\\.test.(ts|tsx)?$",
    transformIgnorePatterns: [],
    globals: {
      'ts-jest': {
        tsconfig: '<rootDir>/src/tsconfig.json'
      }
    }
};

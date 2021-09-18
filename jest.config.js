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
        "<rootDir>/src"
    ],
    testMatch: [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
};

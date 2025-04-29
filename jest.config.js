module.exports = {
    preset: '@shelf/jest-mongodb',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'text', 'lcov'],
    testMatch: ['**/*.test.js'],
  };
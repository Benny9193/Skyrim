export default {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {},
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@js/(.*)$': '<rootDir>/js/$1',
    '^@css/(.*)$': '<rootDir>/css/$1',
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@data/(.*)$': '<rootDir>/data/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/docs/'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/package/e2e/'],
};

/* eslint-disable no-undef */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{ts}', '!src/**/*.{graphql.ts,d.ts}'],
  coverageDirectory: './dist',
};

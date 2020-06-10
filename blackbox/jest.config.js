// Jest defaults NODE_ENV to test if not set, switch it to development instead
if (process.env.NODE_ENV === 'test') process.env.NODE_ENV = 'development'
// require('dotenv-flow').config()
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['dotenv-flow/config'],
  setupFilesAfterEnv: ['jest-allure/dist/setup'],
  verbose: true,
  reporters: ['default', 'jest-junit'],
  moduleNameMapper: {
    '^@utils$': '<rootDir>/lib/utils.js',
    '^@processfiles$': '<rootDir>/lib/processfiles.js',
    '^@logger$': '<rootDir>/config/logger.js'
  }
}

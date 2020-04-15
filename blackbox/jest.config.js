// Jest defaults NODE_ENV to test if not set, switch it to development instead
if (process.env.NODE_ENV === 'test') process.env.NODE_ENV = 'development'
require('dotenv-flow').config()
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-allure/dist/setup'],
  verbose: true,
  reporters: ['default', 'jest-junit'],
  GS_KEY: process.env.GS_KEY,
  moduleNameMapper: {}
}

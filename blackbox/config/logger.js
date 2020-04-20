const { createLogger, format, transports } = require('winston')
const logger = createLogger({
  transports: [
    new transports.Console({
      level: 'error',
      format: format.combine(format.timestamp(), format.simple())
    }),
    new transports.File({
      filename: 'info.log',
      level: 'info',
      format: format.combine(format.timestamp(), format.json())
    })
  ]
})

module.exports = logger

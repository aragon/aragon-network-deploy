const logger = require('../helpers/logger')('Presale')

const command = 'presale'
const describe = 'Deploy Court pre-sale contracts'

const handlerAsync = async (environment, { }) => {
  logger.warn('presale')
  logger.error(environment)
}

module.exports = {
  command,
  describe,
  handlerAsync
}

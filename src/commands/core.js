const logger = require('../helpers/logger')('Core')

const command = 'core'
const describe = 'Deploy Court core contracts'

const handlerAsync = async (environment, { }) => {
  logger.success('core')
  logger.info(environment)
}

module.exports = {
  command,
  describe,
  handlerAsync
}

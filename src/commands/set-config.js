const path = require('path')
const CourtConfigManager = require('../models/modules/CourtConfigManager')

const command = 'set-config'
const describe = 'Change Court config'

const builder = {
  input: { alias: 'i', describe: 'Court config JS file', type: 'string', default: './data/input/court-addresses' },
}

const handlerAsync = async (environment, { network, input }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const manager = new CourtConfigManager(config, environment)
  await manager.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}

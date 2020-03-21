const path = require('path')
const CourtStartDelayer = require('../models/modules/CourtStartDelayer')

const command = 'delay-court'
const describe = 'Delay Court start time'

const builder = {
  config: { alias: 'c', describe: 'Migration config JS file', type: 'string', default: './data/config/court-addresses' },
}

const handlerAsync = async (environment, { network, config: configFilename }) => {
  const config = require(path.resolve(process.cwd(), configFilename))[network]
  const deployer = new CourtStartDelayer(config, environment)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}

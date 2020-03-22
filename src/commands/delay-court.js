const path = require('path')
const CourtStartDelayer = require('../models/modules/CourtStartDelayer')

const command = 'delay-court'
const describe = 'Delay Court start time'

const builder = {
  input: { alias: 'i', describe: 'Migration config JS file', type: 'string', default: './data/input/court-addresses' },
}

const handlerAsync = async (environment, { network, input }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const deployer = new CourtStartDelayer(config, environment)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}

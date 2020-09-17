const path = require('path')
const CourtGovernorManager = require('../models/modules/CourtGovernorManager')

const command = 'set-governor'
const describe = 'Change governor'

const builder = {
  input: { alias: 'i', describe: 'Controller modules config JS file', type: 'string', default: './data/input/court-addresses' },
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/court' },
  governor: { alias: 'g', describe: 'New governor address', type: 'string' }
}

const handlerAsync = async (environment, { network, input, governor }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const manager = new CourtGovernorManager(config, environment)
  await manager.call(governor)
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}

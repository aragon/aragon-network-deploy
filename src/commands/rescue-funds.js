const path = require('path')
const FundsRescuer = require('../models/apps/FundsRescuer')

const command = 'rescue-funds'
const describe = 'Rescue funds from old registry and ANJ token'

const builder = {
  input: { alias: 'i', describe: 'Court config JS file', type: 'string', default: './data/input/funds-rescue' },
}

const handlerAsync = async (environment, { network, input }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const manager = new FundsRescuer(config, environment)
  await manager.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}

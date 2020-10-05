const path = require('path')
const BondingCurveFreezer = require('../models/apps/BondingCurveFreezer')

const command = 'freeze-bonding'
const describe = 'Freeze ANJ bonding curve'

const builder = {
  input: { alias: 'i', describe: 'ANJ bonding curve JS file', type: 'string', default: './data/input/bonding' },
}

const handlerAsync = async (environment, { network, input }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const manager = new BondingCurveFreezer(config, environment)
  await manager.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}

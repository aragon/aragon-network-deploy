const path = require('path')
const CourtStartDelayer = require('../models/modules/CourtStartDelayer')

const command = 'delay-court'
const describe = 'Delay Court start time'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Migration config JS file', type: 'string', default: './data/config/court-addresses.js' },
}

const handlerAsync = async (environment, { network, output: outputDir, config: configFilename }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}/${command}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const deployer = new CourtStartDelayer(config, environment, outputFilepath)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}

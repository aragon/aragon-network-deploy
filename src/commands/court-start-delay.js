const path = require('path')
const Verifier = require('../models/Verifier')
const CourtStartDelayer = require('../models/deployers/CourtStartDelayer')

const command = 'court-start-delay'
const describe = 'Delay Court Start Time'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Migration config JSON file', type: 'string', default: './data/config/registry-migration.js' },
}

const handlerAsync = async (environment, {
  network,
  output: outputDir,
  config: configFilename,
}) => {
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

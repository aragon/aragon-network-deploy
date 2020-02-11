const path = require('path')
const DisputeManagerRestorer = require('../models/deployers/DisputeManagerRestorer')

const command = 'dispute-manager-restore'
const describe = 'Restore DisputeManager'

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

  const deployer = new DisputeManagerRestorer(config, environment, outputFilepath)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}

const path = require('path')
const DisputeManagerMigrator = require('../models/deployers/DisputeManagerMigrator')

const command = 'dispute-manager-migrate'
const describe = 'Migrate DisputeManager'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Migration config JSON file', type: 'string', default: './data/config/dispute-manager-migration.js' },
}

const handlerAsync = async (environment, {
  network,
  output: outputDir,
  config: configFilename,
}) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}/${command}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const deployer = new DisputeManagerMigrator(config, environment, outputFilepath)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}

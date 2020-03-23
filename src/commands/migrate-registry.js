const path = require('path')
const JurorsRegistryMigrator = require('../models/upgrades/JurorsRegistryMigrator')

const command = 'migrate-registry'
const describe = 'Migrate JurorsRegistry'

const builder = {
  close: { describe: 'Whether to set up a new migrator or request closing an existing one', type: 'boolean', default: false },
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Migration config JS file', type: 'string', default: './data/config/registry-migration.js' },
}

const handlerAsync = async (environment, { close, network, output: outputDir, config: configFilename }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}/${command}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const deployer = new JurorsRegistryMigrator(config, environment, outputFilepath, close)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}

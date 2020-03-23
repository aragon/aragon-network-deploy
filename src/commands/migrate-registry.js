const path = require('path')
const JurorsRegistryMigrator = require('../models/upgrades/JurorsRegistryMigrator')

const command = 'migrate-registry'
const describe = 'Migrate JurorsRegistry'

const builder = {
  input: { alias: 'i', describe: 'Migration config JS file', type: 'string', default: './data/input/registry-migration' },
  close: { describe: 'Whether to set up a new migrator or request closing an existing one', type: 'boolean', default: false },
}

const handlerAsync = async (environment, { network, input, close }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const deployer = new JurorsRegistryMigrator(config, environment, close)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}

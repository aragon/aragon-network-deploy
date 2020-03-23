const rpc = require('./dispute-manager-migration.rpc')
const staging = require('./dispute-manager-migration.staging')
const usability = require('./dispute-manager-migration.usability')
const rinkeby = require('./dispute-manager-migration.rinkeby')
const mainnet = require('./dispute-manager-migration.mainnet')

const environments = {
  rpc,
  staging,
  usability,
  rinkeby,
  mainnet
}

module.exports = environments

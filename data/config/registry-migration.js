const rpc = require('./registry-migration.rpc')
const staging = require('./registry-migration.staging')
const rinkeby = require('./registry-migration.rinkeby')
const mainnet = require('./registry-migration.mainnet')

const environments = {
  rpc,
  staging,
  rinkeby,
  mainnet
}

module.exports = environments

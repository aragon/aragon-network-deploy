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

const controllerIds = {
  disputes:                     '0x14a6c70f0f6d449c014c7bbc9e68e31e79e8474fb03b7194df83109a2d888ae6',   // DISPUTE_MANAGER module ID
  registry:                     '0x3b21d36b36308c830e6c4053fb40a3b6d79dde78947fbf6b0accd30720ab5370',   // JURORS_REGISTRY module ID
}

Object.keys(environments).map(environment => environments[environment].controllerIds = controllerIds)

module.exports = environments

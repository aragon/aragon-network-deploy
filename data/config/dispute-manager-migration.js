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

const controllerIds = {
  disputes:                     '0x14a6c70f0f6d449c014c7bbc9e68e31e79e8474fb03b7194df83109a2d888ae6',   // DISPUTE_MANAGER module ID
}

Object.keys(environments).map(environment => environments[environment].controllerIds = controllerIds)

module.exports = environments

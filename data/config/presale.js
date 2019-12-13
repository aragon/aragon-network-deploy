const rpc = require('./presale.rpc')
const staging = require('./presale.staging')
const rinkeby = require('./presale.rinkeby')
const mainnet = require('./presale.mainnet')

module.exports = {
  rpc,
  staging,
  rinkeby,
  mainnet
}

const devnet = require('./court.devnet')
const ropsten = require('./court.ropsten')
const rinkeby = require('./court.rinkeby')
const mainnet = require('./court.mainnet')

module.exports = {
  rpc: devnet,
  devnet,
  rinkeby,
  ropsten,
  mainnet
}

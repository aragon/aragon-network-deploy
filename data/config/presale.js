const devnet = require('./presale.devnet')
const rinkeby = require('./presale.rinkeby')
const mainnet = require('./presale.mainnet')

module.exports = {
  rpc: devnet,
  devnet,
  rinkeby,
  mainnet
}

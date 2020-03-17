const rpc = require('./presale.rpc')
const staging = require('./presale.staging')
const rinkeby = require('./presale.rinkeby')
const mainnet = require('./presale.mainnet')
const usability = require('./presale.usability')

// There is no APM registry on Ropsten, thus we cannot publish the pre-sale there to use it from a DAO

module.exports = {
  rpc,
  staging,
  rinkeby,
  mainnet,
  usability
}

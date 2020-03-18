const rpc = require('./court.rpc')
const ropsten = require('./court.ropsten')
const rinkeby = require('./court.rinkeby')
const usability = require('./court.usability')
const staging = require('./court.staging')
const mainnet = require('./court.mainnet')

module.exports = {
  rpc,
  ropsten,
  rinkeby,
  usability,
  staging,
  mainnet
}

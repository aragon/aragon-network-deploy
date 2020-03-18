const rpc = require('./uniswap-wrapper.rpc')
const staging = require('./uniswap-wrapper.staging')
const rinkeby = require('./uniswap-wrapper.rinkeby')
const usability = require('./uniswap-wrapper.usability')
const mainnet = require('./uniswap-wrapper.mainnet')

module.exports = {
  rpc,
  staging,
  usability,
  rinkeby,
  mainnet
}

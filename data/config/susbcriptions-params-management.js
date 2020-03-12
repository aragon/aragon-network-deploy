const config = require('./court')

const subscriptionsAddresses = {
  'rpc':      undefined,
  'ropsten': '0x858870687c3270Bcd33Fd24166bE9b4a50594283',
  'staging': '0xFfd7Fa4b6c8dAf23E8B13E792E3d93E6b431bdCf',
  'rinkeby': '0xE0F165EfC0A266dBa029B6237f15EB501a3ea226',
  'mainnet': '0x3b4c91Cfc006f48344eAFCe8783E46b690d5068F',
}

const aragonNetworkDAO = require('./ANDAO.js')

Object.keys(subscriptionsAddresses).map(
  network => {
    config[network].subscriptions.address = subscriptionsAddresses[network]
    config[network].aragonNetworkDAO = aragonNetworkDAO[network]
  }
)

console.log(config.rpc)

module.exports = config

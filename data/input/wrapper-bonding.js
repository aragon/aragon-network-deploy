const uniswap = require('./uniswap')
const governor = require('./governor')
const { requireOutput, getAddressIfDefined } = require('../../src/helpers/require-output')

const environments = {}
const networks = ['rpc', 'usability', 'rinkeby', 'staging', 'mainnet']    // There is no bonding curve deployed to Ropsten

networks.forEach(network => {
  environments[network] = {
    uniswap:     uniswap[network],
    governor:    governor[network],
    registry:    requireOutput(`court.${network}`, getAddressIfDefined('registry')),
    bondedToken: requireOutput(`minime.${network}`, getAddressIfDefined('ANJ')),
  }
})

module.exports = environments

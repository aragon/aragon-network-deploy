const uniswap = require('./uniswap')
const governor = require('./governor')
const { requireOutput, getAddressIfDefined } = require('../../src/helpers/require-output')

const environments = {}
const networks = ['rpc', 'rinkeby', 'staging', 'mainnet']    // There is no presale deployed to Ropsten

networks.forEach(network => {
  environments[network] = {
    uniswap:     uniswap[network],
    governor:    governor[network],
    registry:    requireOutput(`court.${network}`, getAddressIfDefined('registry')),
    bondedToken: requireOutput(`minime.${network}`, getAddressIfDefined('ANJ')),
    presale:     requireOutput(`template.${network}`, getAddressIfDefined('balance-redirect-presale')),
  }
})

module.exports = environments

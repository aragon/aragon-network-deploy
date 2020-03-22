const uniswap = require('./uniswap')
const governor = require('./governor')
const requireOutput = require('../../src/helpers/require-output')

const environments = {}
const networks = ['rpc', 'usability', 'rinkeby', 'staging', 'mainnet']    // There is no presale deployed to Ropsten

networks.forEach(network => {
  environments[network] = {
    uniswap:     uniswap[network],
    governor:    governor[network],
    registry:    requireOutput(`court.${network}`, court => court.registry.address),
    bondedToken: requireOutput(`minime.${network}`, tokens => tokens.ANJ.address),
    presale:     requireOutput(`template.${network}`, template => template['balance-redirect-presale'].address),
  }
})

module.exports = environments

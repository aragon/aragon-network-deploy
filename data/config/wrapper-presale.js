const governor = require('./governor')

const environments = {}
const networks = ['rpc', 'usability', 'rinkeby', 'staging', 'mainnet']

networks.forEach(network => {
  environments[network] = {
    owner:    governor[network],
    presale:  require(`../output/presale.${network}`)['balance-redirect-presale'].address,
    registry: require(`../output/court.${network}`).registry.address,
    bondedToken: require(`../output/minime.${network}`).ANJ.address,
    uniswap:  require(`./wrapper-bonding`)[network].uniswap,
  }
})

module.exports = environments

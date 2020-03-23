const governor = require('./governor')

const environments = {}
const networks = ['rpc', 'usability', 'rinkeby', 'staging', 'mainnet']

networks.forEach(network => {
  environments[network] = {
    governor:    governor[network],
    bondedToken: require(`../output/minime.${network}`).ANJ.address,
    registry:    require(`../output/court.${network}`).registry.address,
    presale:     require(`../output/template.${network}`)['balance-redirect-presale'].address,
    uniswap:     require(`./wrapper-bonding`)[network].uniswap,
  }
})

module.exports = environments

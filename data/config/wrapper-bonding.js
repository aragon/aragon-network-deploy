const environments = {
  mainnet: {
    uniswap: '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95', // Uniswap Factory address
  },
  rinkeby: {
    uniswap: '0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36', // Uniswap Factory address
  },
  staging: {
    uniswap: '0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36', // Uniswap Factory address
  },
  usability: {
    uniswap: '0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36', // Uniswap Factory address
  },
  ropsten: {
    uniswap: undefined,                                    // Uniswap Factory address
  },
  rpc: {
    uniswap: undefined,                                    // Uniswap Factory address
  }
}

Object.keys(environments).forEach(network => {
  environments[network].owner = require('./governor')[network].agent
  environments[network].bondedToken = require(`../output/minime.${network}`).ANJ.address
  environments[network].registry = require(`../output/court.${network}`).registry.address
})

module.exports = environments

const ANDAO = require('ANDAO')

const environments = {
  mainnet: {
    newDisputeManager: '0xf4d2c04D4FE5B19E7adA331ef5450A99a593fEC9'
  },
  rinkeby: {
    newDisputeManager: '0x240C2e510Db43867BD868Cc56060084b7f7b769d'
  },
  usability: {
    newDisputeManager: '0x4fCb772042b935BD7D510350c14B44e0BbBaB836'
  },
  staging: {
    newDisputeManager: '0x6F81524ba56feAF2004D0896ff6E4b557e9De1e9'
  },
  ropsten: {
    newDisputeManager: '0xD1f2Cd944456D7d8A6f58d78bA12dF13051E5591'
  },
  rpc: {
    newDisputeManager: undefined
  }
}

Object.keys(environments).forEach(network => {
  environments[network].court = require(`../output/court.${network}`).court.address
  environments[network].owner = ANDAO[network].agent
  environments[network].aragonNetworkDAO = {
    voting: ANDAO[network].voting,
    tokenManager: ANDAO[network].tokenManager
  }
})

module.exports = environments

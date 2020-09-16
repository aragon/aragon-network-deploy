const governor = require('./governor')
const { requireOutput, getAddressIfDefined } = require('../../src/helpers/require-output')

const environments = {
  mainnet: {
    anDaoAgent: undefined,
  },
  rinkeby: {
    anDaoAgent: undefined,
  },
  staging: {
    anDaoAgent: undefined,
  },
  ropsten: {
    anDaoAgent: undefined,
  },
  rpc: {
    anDaoAgent: undefined,
  },
}

Object.keys(environments).forEach(network => {
  environments[network] = {
    ...environments[network],
    governor:    governor[network],
    antVoting:   requireOutput(`voting-installation.${network}`, getAddressIfDefined('voting')),
    court:       requireOutput(`court.${network}`, getAddressIfDefined('court')),
  }
})

module.exports = environments

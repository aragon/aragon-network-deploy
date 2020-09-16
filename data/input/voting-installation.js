const { bigExp, bn } = require('@aragon/contract-helpers-test')

const governor = require('./governor')
const { requireOutput, getAddressIfDefined } = require('../../src/helpers/require-output')

const ONE_HOUR = 60 * 60

const VOTING_DEFAULTS = {
  votingDuration:               ONE_HOUR * 60,                                 // 60 hours
  neededSupport:                bn('6'.repeat(18)),                            // 66.666...%
  minimumAcceptanceQuorum:      bigExp(25, 14),                                // 0.25%
}

const environments = {
  mainnet: {
    ...VOTING_DEFAULTS,
  },
  rinkeby: {
    ...VOTING_DEFAULTS,
  },
  staging: {
    ...VOTING_DEFAULTS,
  },
  ropsten: {
    ...VOTING_DEFAULTS,
  },
  rpc: {
    ...VOTING_DEFAULTS,
  },
}

Object.keys(environments).forEach(network => {
  environments[network] = {
    ...environments[network],
    governor:       governor[network],
    ant:            requireOutput(`minime.${network}`, getAddressIfDefined('ANT')),
  }
})

module.exports = environments

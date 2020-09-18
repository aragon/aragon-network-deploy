const governor = require('./governor')
const { bn, bigExp } = require('../../src/helpers/numbers')
const { requireOutput, getAddressIfDefined } = require('../../src/helpers/require-output')

const ONE_HOUR = 60 * 60

const environments = {
  mainnet: {
    duration:               ONE_HOUR * 60,                                 // 60 hours
    support:                bn('6'.repeat(18)),                            // 66.666...%
    acceptance:             bigExp(25, 14),                                // 0.25%
  },
  rinkeby: {
    duration:               ONE_HOUR * 60,                                 // 60 hours
    support:                bn('6'.repeat(18)),                            // 66.666...%
    acceptance:             bigExp(1, 14),                                 // 0.01%
  },
  staging: {
    duration:               ONE_HOUR / 2,                                  // 30 mins
    support:                bigExp(20, 16),                                // 20%
    acceptance:             bigExp(1, 14),                                 // 0.01%
  },
  ropsten: {
    duration:               ONE_HOUR * 60,                                 // 60 hours
    support:                bn('6'.repeat(18)),                            // 66.666...%
    acceptance:             bigExp(25, 14),                                // 0.25%
  },
  rpc: {
    duration:               ONE_HOUR / 2,                                  // 30 mins
    support:                bigExp(20, 16),                                // 20%
    acceptance:             bigExp(1, 14),                                 // 0.01%
  },
}

Object.keys(environments).forEach(network => {
  environments[network] = {
    ...environments[network],
    governor:       governor[network],
    token:          requireOutput(`minime.${network}`, getAddressIfDefined('ANT')),
  }
})

module.exports = environments

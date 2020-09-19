const governor = require('./governor')
const { requireOutput, getAddressIfDefined } = require('../../src/helpers/require-output')

const environments = {
  mainnet: {
    funds: undefined,
    config: undefined,
    modules: undefined,
  },
  rinkeby: {
    funds: '0xb2157ad1747de2d978366c15a7bbdf5511dac6b1',
    config: '0x47ceb55f3492343310736645d7c49bd150f49976',
    modules: '0xb2157ad1747de2d978366c15a7bbdf5511dac6b1',
  },
  staging: {
    funds: '0x1f13ebb6e9b1453347cfcfc22e423d143090da96',
    config: '0x1f13ebb6e9b1453347cfcfc22e423d143090da96',
    modules: '0x1f13ebb6e9b1453347cfcfc22e423d143090da96',
  },
  ropsten: {
    funds: undefined,
    config: undefined,
    modules: undefined,
  },
  rpc: {
    funds: undefined,
    config: undefined,
    modules: undefined,
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

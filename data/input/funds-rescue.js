const governor = require('./governor')
const { bigExp } = require('../../src/helpers/numbers')
const { requireOutput, getAddressIfDefined } = require('../../src/helpers/require-output')

const environments = {
  mainnet: {
    governor: governor['mainnet'],
    fundraisingTokenManager: requireOutput('template.mainnet', getAddressIfDefined('token-manager')),
    newTokenManagerBase: 'TBD', // TODO: deploy
    oldJurorsRegistry:   '0x8bEa04A94aEc27CE8C2409b0e0F28A02996d264d',
    anj: { // https://etherscan.io/address/0x8bea04a94aec27ce8c2409b0e0f28a02996d264d/advanced#tokentxns
      ...requireOutput('minime.mainnet', getAddressIfDefined('ANJ')),
      rescues: [
        { to: '0x4560a9f2fd9253eb7017258c5a347bcc21dd795b', amount: bigExp(10100, 18) },
        { to: '0x50d271519510c55b15408c2c6aeed69800694ef4', amount: bigExp(10000, 18) },
        { to: '0x57c2570f1a4228a3aeff4fe533826c2a04a2d52f', amount: bigExp(10000, 18) },
      ]
    },
    dai: { // https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f?a=0xcd62b1c403fa761baadfc74c525ce2b51780b184
      ...requireOutput('minime.mainnet', getAddressIfDefined('DAI')),
      recipient: '0x365f8769bc8e6c7e9f975f4d58a9c07c9e82f413'
    }
  },
  rinkeby: {
    governor: governor['rinkeby'],
    fundraisingTokenManager: requireOutput('template.rinkeby', getAddressIfDefined('token-manager')),
    newTokenManagerBase: '0xea6B826761f25C744d0B87438756b0e10AEEf3Eb',
    oldJurorsRegistry:   '0x5ce2AD3B6dff8f2E5e69F6Dc9060BB6eb5bDceb8',
    anj: { // https://rinkeby.etherscan.io/address/0x5ce2AD3B6dff8f2E5e69F6Dc9060BB6eb5bDceb8/advanced#tokentxns
      address: requireOutput('minime.rinkeby', getAddressIfDefined('ANJ')),
      rescues: [
        { to: '0x4560a9f2fd9253eb7017258c5a347bcc21dd795b', amount: bigExp(10100, 18) },
        { to: '0x50d271519510c55b15408c2c6aeed69800694ef4', amount: bigExp(10000, 18) },
        { to: '0x57c2570f1a4228a3aeff4fe533826c2a04a2d52f', amount: bigExp(10000, 18) },
      ]
    },
    dai: { // https://rinkeby.etherscan.io/token/0xcb5161Be1ae8e20b8F3cE7466C655bF84FB40756?a=0x992aB2a0E2c335ed3FBFA406E619aA283125d9D7
      address: requireOutput('minime.rinkeby', getAddressIfDefined('DAI')),
      recipient: '0x365f8769bc8e6c7e9f975f4d58a9c07c9e82f413'
    }
  },
}

module.exports = environments

const governor = require('./governor')

const environments = {
  rpc: {
    factory:          undefined,                                      // Will be deployed unless specified
  },
  staging: {
    controller:       undefined,				                              // Will be set to the sender
    factory:          '0x6ffeb4038f7f077c4d20eaf1706980caec31e2bf',   // MiniMe token factory used for the templates
  },
  ropsten: {
    controller:       undefined,  				                            // Will be set to the sender
    factory:          '0x1ce5621d386b2801f5600f1dbe29522805b8ac11',   // MiniMe token factory used for the templates
  },
  rinkeby: {
    controller:       undefined, 				                              // Will be set to the sender
    factory:          '0x6ffeb4038f7f077c4d20eaf1706980caec31e2bf',   // MiniMe token factory used for the templates
  },
  mainnet: {
    controller:       governor.mainnet,                               // Will be set to the mainnet governor
    factory:          '0x081d5b92280eBF7deacdfFECEc6f2D356f47266C',   // MiniMe token factory used for the templates
  },
}

Object.keys(environments).forEach(network => {
  environments[network] = {
    ...environments[network],
    name: 'Aragon Network Juror',
    symbol: 'ANJ',
    decimals: 18,
    transfersEnabled: true,
  }
})

module.exports = environments

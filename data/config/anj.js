const governor = require('./governor')

const config = {
  name: 'Aragon Network Juror',
  symbol: 'ANJ',
  decimals: 18
}

module.exports = {
  rpc: {
    ...config,
    factory:          undefined,                                      // will be deployed unless specified
    transfersEnabled: true,
  },
  staging: {
    ...config,
    controller:       governor.staging.agent,                         // Agent of AN DAO Staging (short)
    factory:          '0x6ffeb4038f7f077c4d20eaf1706980caec31e2bf',   // MiniMe token factory used for the templates
    transfersEnabled: true,
  },
  ropsten: {
    ...config,
    controller:       governor,                                       // EOA
    factory:          '0x1ce5621d386b2801f5600f1dbe29522805b8ac11',   // MiniMe token factory used for the templates
    transfersEnabled: true,
  },
  rinkeby: {
    ...config,
    controller:       governor.rinkeby.agent,                         // Agent of AN DAO Rinkeby
    factory:          '0x6ffeb4038f7f077c4d20eaf1706980caec31e2bf',   // MiniMe token factory used for the templates
    transfersEnabled: true,
  },
  usability: {
    ...config,
    controller:       governor.usability.agent,                       // Agent of AN DAO Rinkeby
    factory:          '0x6ffeb4038f7f077c4d20eaf1706980caec31e2bf',   // MiniMe token factory used for the templates
    transfersEnabled: true,
  },
  mainnet: {
    ...config,
    controller:       governor.mainnet.agent,                         // Agent of AN DAO
    factory:          '0x081d5b92280eBF7deacdfFECEc6f2D356f47266C',   // MiniMe token factory used for the templates
    transfersEnabled: true,
  },
}

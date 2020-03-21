const ANDAO = require('./ANDAO')

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
    controller:       ANDAO.staging.agent,                            // Agent of AN DAO Staging (short)
    factory:          '0x6ffeb4038f7f077c4d20eaf1706980caec31e2bf',   // MiniMe token factory used for the templates
    transfersEnabled: true,
  },
  ropsten: {
    ...config,
    controller:       '0x0090aed150056316e37fe6dfa10dc63e79d173b6',   // EOA
    factory:          '0x1ce5621d386b2801f5600f1dbe29522805b8ac11',   // MiniMe token factory used for the templates
    transfersEnabled: true,
  },
  rinkeby: {
    ...config,
    controller:       ANDAO.rinkeby.agent,                            // Agent of AN DAO Rinkeby
    factory:          '0x6ffeb4038f7f077c4d20eaf1706980caec31e2bf',   // MiniMe token factory used for the templates
    transfersEnabled: true,
  },
  usability: {
    ...config,
    controller:       ANDAO.usability.agent,                          // Agent of AN DAO Rinkeby
    factory:          '0x6ffeb4038f7f077c4d20eaf1706980caec31e2bf',   // MiniMe token factory used for the templates
    transfersEnabled: true,
  },
  mainnet: {
    ...config,
    controller:       ANDAO.mainnet.agent,                            // Agent of AN DAO
    factory:          '0x081d5b92280eBF7deacdfFECEc6f2D356f47266C',   // MiniMe token factory used for the templates
    transfersEnabled: true,
  },
}

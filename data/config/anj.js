const config = {
  name: 'Aragon Network Juror',
  symbol: 'ANJ',
  decimals: 18
}

module.exports = {
  rpc: {
    ...config,
    controller:       '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7',   // aragen address #1
    factory:          undefined,                                      // will be deployed unless specified
    transfersEnabled: true,
  },
  staging: {
    ...config,
    controller:       '0xde8bf81d4a8b67f51dc909035cca5b4e14e92d88',   // AN DAO Staging Agent
    factory:          '0x6ffeb4038f7f077c4d20eaf1706980caec31e2bf',   // mini me token factory used for the templates
    transfersEnabled: true,
  },
  rinkeby: {
    ...config,
    factory:          '0x6ffeb4038f7f077c4d20eaf1706980caec31e2bf',   // mini me token factory used for the templates
    transfersEnabled: true,
  },
  ropsten: {
    ...config,
    factory:          '0x1ce5621d386b2801f5600f1dbe29522805b8ac11',   // mini me token factory used for the templates
    transfersEnabled: true,
  },
  mainnet: {
    ...config,
    controller:       '0x5e8c17a6065c35b172b10e80493d2266e2947df4',   // Agent of AN DAO
    factory:          '0x081d5b92280eBF7deacdfFECEc6f2D356f47266C',   // mini me token factory used for the templates
    transfersEnabled: true,
  },
}

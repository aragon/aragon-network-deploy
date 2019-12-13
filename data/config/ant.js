const config = {
  name: 'Aragon Network Token',
  symbol: 'ANT',
  decimals: 18
}

module.exports = {
  rpc: {
    ...config,
    factory:          undefined,                                      // will be deployed unless specified
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
}

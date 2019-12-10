module.exports = {
  infra: {
    ens: '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1',        // aragen ENS
    daoFactory: '0x5d94e3e7aec542ab0f9129b9a7badeb5b3ca0f77', // aragen DAO factory
    registrar: '0xf1f8aac64036cdd399886b1c157b7e3b361093f3'   // aragen aragonID
  },
  instance: {
    owner: '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7',      // aragen address #1
    id: 'anjpresale',
    collateralToken: '0x2e25c8F88c5cCcbC9400e5bc86cF9C58C7604327',
    bondedToken: '0x019F12a7DAa44A34CD0FF35055b0e2D4679D8521',
    period: '600',                                            // 10 min
    exchangeRate: '100000000',                                // 1/100
    openDate: '0',
    reserveRatio: '33333',                                    // 33.333%
    batchBlocks: '1',
    slippage: '100000000000000000'                            // 10%
  }
}

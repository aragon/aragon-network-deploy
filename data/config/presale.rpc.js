// 2 minutes from now
const OPEN_DATE = Math.floor(new Date() / 1000 + 120).toString()

module.exports = {
  infra: {
    ens:              '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1',   // Aragen ENS
    daoFactory:       '0x5d94e3e7aec542ab0f9129b9a7badeb5b3ca0f77',   // Aragen DAO factory
    registrar:        '0xf1f8aac64036cdd399886b1c157b7e3b361093f3'    // Aragen aragonID
  },
  instance: {
    owner:            '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7',   // Aragen address #1
    id:               'anjpresale',                                   // TODO: clarify
    collateralToken:  '0x2e25c8F88c5cCcbC9400e5bc86cF9C58C7604327',   // TODO: clarify
    bondedToken:      '0x019F12a7DAa44A34CD0FF35055b0e2D4679D8521',   // TODO: clarify
    period:           '600',                                          // 10 min
    exchangeRate:     '100000000',                                    // 1/100
    openDate:         OPEN_DATE,                                      // Presale starts, 2 minutes from now
    reserveRatio:     '33333',                                        // 33.333%
    batchBlocks:      '1',                                            // TODO: clarify
    slippage:         '100000000000000000'                            // 10%
  },
  aragonNetworkDAO: {
    votingApp:        '0x3bf37efD74354A29f9507D1A21329b773bB49F58',   // TODO: clarify
    tokenManager:     '0xEB62b78213c6C2E5c0698dDa67E3260007b8C999',   // TODO: clarify
    voteDescription:  'Change ANJ controller to template and deploy new presale and bonding curve instance'
  }
}

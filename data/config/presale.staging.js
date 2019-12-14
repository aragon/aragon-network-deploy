const START_DATE = Math.floor(new Date() / 1000) + 1200 // now + 20 min

module.exports = {
  infra: {
    ens: '0xfe03625ea880a8cba336f9b5ad6e15b0a3b5a939',
    daoFactory: '0xf959e8953e2fe03782a7b86a7a5d948cb511ef5d',
    registrar: '0xa2e76aa249e3f52ea94c175662adadf27185484a'
  },
  instance: {
    owner: '0xde8bf81d4a8b67f51dc909035cca5b4e14e92d88',           // AN-DAO controller
    id: 'anj-presale-short-pre-mint',
    collateralToken: '0xF68eb8077744b49F2B289c0Fd12Bbc9f3729dFe3', // ANT
    bondedToken: '0x17741e3521887D51298c573fc6ac1eeEF1E8e44B',     // ANJ
    period: '86400',                                               // 1 day
    openDate: START_DATE,                                          // presale start
    exchangeRate: '100000000',                                     // 1/100
    beneficiaryPct: '200000',                                      // 20%, pre-minting
    reserveRatio: '33333',                                         // 33%
    batchBlocks: '1',
    slippage: '100000000000000000'                                 // 10%
  },
  aragonNetworkDao: {
    votingApp: '0xaad2ccf51b42ea7f27948c38b4f7afd8174ef217',
    tokenManager: '0x08d25ce71579c2b97b688bc8a7d0b35b92504ec3',
    voteDescription: 'Change ANJ controller to template and deploy new presale and bonding curve instance'
  }
}

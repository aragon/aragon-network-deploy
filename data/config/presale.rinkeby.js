const START_DATE = Math.floor(new Date() / 1000) + 1200 // now + 20 min

module.exports = {
  infra: {
    ens: '0x98df287b6c145399aaa709692c8d308357bc085d',
    daoFactory: '0xad4d106b43b480faa3ef7f98464ffc27fc1faa96',
    registrar: '0x3665e7bfd4d3254ae7796779800f5b603c43c60d'
  },
  instance: {
    owner: '0x9aedfbe0f3ed33cbb71f937cb9eb0ff1f4dfc076',           // AN-DAO controller
    id: 'anj-presale-5',
    collateralToken: '0xF68eb8077744b49F2B289c0Fd12Bbc9f3729dFe3', // ANT
    bondedToken: '0x9980c8bF7Eb8cc8DBafD05d030DB7b18b9Fb3cDC',     // ANJ
    period: '864000',                                              // presale duration, 10 day
    openDate: START_DATE,                                          // presale start
    exchangeRate: '100000000',                                     // for presale: 1/100
    beneficiaryPct: '200000',                                      // 20%, pre-minting
    reserveRatio: '33333',                                         // 33%
    batchBlocks: '1',                                              // market maker batch size
    slippage: '100000000000000000'                                 // 10%
  },
  aragonNetworkDao: {
    votingApp: '0xb0c839957bc47541d747e5238c06990e3a41c2a3',
    tokenManager: '0x0cc31e2d5117d25fe50ee9d569613851e6bb0dd9',
    voteDescription: 'Change ANJ controller to template and deploy new presale and bonding curve instance'
  },
  wrapper: {
    registry: '0x1FFD20263cb09dAAaA6698A9ec41E1b2297E72A5',        // Court Jurors Registry
    presale: '0xB1C3D652C8b999AF4a17FDc0393629a317174b3B'          // Fundraising presale contract
  }
}

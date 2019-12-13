// 2 minutes from now
const OPEN_DATE = Math.floor(new Date() / 1000 + 120).toString()

module.exports = {
  infra: {
    ens:              '0x98df287b6c145399aaa709692c8d308357bc085d',   // Rinkeby ENS instance
    daoFactory:       '0xad4d106b43b480faa3ef7f98464ffc27fc1faa96',   // DAO factory used for the templates in Rinkeby
    registrar:        '0x3665e7bfd4d3254ae7796779800f5b603c43c60d'    // Rinkeby aragonID
  },
  instance: {
    owner:            '0x9aedfbe0f3ed33cbb71f937cb9eb0ff1f4dfc076',   // Agent of AN DAO Rinkeby
    id:               'anj-presale',                                  // TODO: clarify
    collateralToken:  '0xF68eb8077744b49F2B289c0Fd12Bbc9f3729dFe3',   // ANT
    bondedToken:      '0x1B1EdCF4f3C5bB705a7670154e2C65569d0676Be',   // ANJ
    period:           '86400',                                        // Presale duration, 1 day TODO: isn't this too low?
    exchangeRate:     '100000000',                                    // For presale: 1/100
    openDate:         OPEN_DATE,                                      // Presale start, 2 minutes from now
    reserveRatio:     '33333',                                        // 33%
    batchBlocks:      '1',                                            // Market maker batch size
    slippage:         '100000000000000000'                            // 10%
  },
  aragonNetworkDAO: {
    votingApp:        '0xb0c839957bc47541d747e5238c06990e3a41c2a3',   // Voting of AN DAO Rinkeby
    tokenManager:     '0x0cc31e2d5117d25fe50ee9d569613851e6bb0dd9',   // Token Manager of AN DAO Rinkeby
    voteDescription:  'Change ANJ controller to template and deploy new presale and bonding curve instance'
  }
}

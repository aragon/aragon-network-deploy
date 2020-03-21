const START_DATE = Math.floor(new Date() / 1000 + 600).toString()         // 10 minutes from now

module.exports = {
  infra: {
    ens:              '0x98df287b6c145399aaa709692c8d308357bc085d',       // Rinkeby ENS instance
    daoFactory:       '0xad4d106b43b480faa3ef7f98464ffc27fc1faa96',       // DAO factory used for the templates in Rinkeby
    registrar:        '0x3665e7bfd4d3254ae7796779800f5b603c43c60d'        // Rinkeby aragonID
  },
  instance: {
    owner:            '0x9aedfbe0f3ed33cbb71f937cb9eb0ff1f4dfc076',       // Agent of AN DAO Rinkeby
    id:               'uw-001',                                           // ID of the template to be registered in aragon ID
    collateralToken:  '0x2D23F49a6C1B60e614952d8b0D53bd7a2DbF6433',       // ANT
    bondedToken:      '0x929F3B27a22a7A56FC8d89617033D22e53840aC9',       // ANJ
    period:           '864000',                                           // Presale period will last 10 days, bonding curve will start right after that
    exchangeRate:     '100000000',                                        // Presale exchange rate 1 ANT = 100 ANJ
    openDate:         START_DATE,                                         // Presale will start in 10 minutes from now
    beneficiaryPct:   '200000',                                           // 20% of the generated ANJ will be minted for the owner
    reserveRatio:     '33333',                                            // Bonding curve reserve ratio of 33%, also used to compute the virtual balance
    batchBlocks:      '1',                                                // Market maker batch size
    slippage:         '100000000000000000'                                // 10%
  },
  aragonNetworkDAO: {
    voting:           '0xb0c839957bc47541d747e5238c06990e3a41c2a3',       // Voting of AN DAO Rinkeby
    tokenManager:     '0x0cc31e2d5117d25fe50ee9d569613851e6bb0dd9',       // Token Manager of AN DAO Rinkeby
  },
  wrapper: {
    owner:            '0x9aedfbe0f3ed33cbb71f937cb9eb0ff1f4dfc076',       // Agent of AN DAO Rinkeby
    registry:         '0x8529A0aF5b39C7Ab5Df6E20Aa3bf44B0F82fF680',       // Court's Jurors Registry instance on Rinkeby
    presale:          '0x51974a685c653aFECfB383017eAb65A501f35aD9',       // Fundraising presale instance on Rinkeby
    uniswap:          '0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36',       // Uniswap Factory address on Rinkeby
  }
}

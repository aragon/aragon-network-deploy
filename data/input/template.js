const governor = require('./governor')
const { requireOutput, getAddressIfDefined } = require('../../src/helpers/require-output')

// 2020, Jan 7th 16.00 UTC
const PRESALE_START_DATE = Math.floor(new Date('2020-01-07T16:00:00.000Z') / 1000).toString()

// 2020, Feb 10th 00.00 UTC
const BONDING_START_DATE = Math.floor(new Date('2020-02-10T00:00:00.000Z') / 1000).toString()
const PRESALE_PERIOD = BONDING_START_DATE - PRESALE_START_DATE


const environments = {
  mainnet: {
    infra: {
      ens:              '0x314159265dd8dbb310642f98f50c066173c1259b',       // Mainnet ENS instance
      daoFactory:       '0xb9da44c051c6cc9e04b7e0f95e95d69c6a6d8031',       // DAO factory used for the templates in Mainnet
      registrar:        '0x546aa2eae2514494eeadb7bbb35243348983c59d'        // Mainnet aragonID
    },
    instance: {
      openDate:         PRESALE_START_DATE,                                 // Presale start on Jan 7th 2020 4pm UTC
      period:           PRESALE_PERIOD,                                     // Diff in seconds between court start date (Feb 10th) and presale start date
      exchangeRate:     '100000000',                                        // Presale exchange rate 1 ANT = 100 ANJ (PPM)
      beneficiaryPct:   '100000',                                           // 10% of the generated ANJ will be minted for the owner
      reserveRatio:     '250000',                                           // Bonding curve reserve ratio of 25% (PPM), also used to compute the virtual balance
      batchBlocks:      '1',                                                // Market maker batch size
      slippage:         '100000000000000000'                                // 10% (PPM)
    },
  },
  rinkeby: {
    infra: {
      ens:              '0x98df287b6c145399aaa709692c8d308357bc085d',       // Rinkeby ENS instance
      daoFactory:       '0xad4d106b43b480faa3ef7f98464ffc27fc1faa96',       // DAO factory used for the templates in Rinkeby
      registrar:        '0x3665e7bfd4d3254ae7796779800f5b603c43c60d'        // Rinkeby aragonID
    },
    instance: {
      openDate:         Math.floor(new Date() / 1000 + 600).toString(),     // Presale will start in 10 minutes from now
      period:           '864000',                                           // Presale period will last 10 days, bonding curve will start right after that
      exchangeRate:     '100000000',                                        // Presale exchange rate 1 ANT = 100 ANJ
      beneficiaryPct:   '200000',                                           // 20% of the generated ANJ will be minted for the owner
      reserveRatio:     '33333',                                            // Bonding curve reserve ratio of 33%, also used to compute the virtual balance
      batchBlocks:      '1',                                                // Market maker batch size
      slippage:         '100000000000000000'                                // 10%
    },
  },
  staging: {
    infra: {
      ens:              '0xfe03625ea880a8cba336f9b5ad6e15b0a3b5a939',       // Staging ENS instance
      daoFactory:       '0xf959e8953e2fe03782a7b86a7a5d948cb511ef5d',       // DAO factory used for the templates in Staging
      registrar:        '0xa2e76aa249e3f52ea94c175662adadf27185484a'        // Staging aragonID
    },
    instance: {
      openDate:         Math.floor(new Date() / 1000 + 600).toString(),     // Presale will start in 10 minutes from now
      period:           '86400',                                            // Presale period will last 1 day, bonding curve will start right after that
      exchangeRate:     '100000000',                                        // Presale exchange rate 1 ANT = 100 ANJ
      beneficiaryPct:   '200000',                                           // 20% of the generated ANJ will be minted for the owner
      reserveRatio:     '33333',                                            // Bonding curve reserve ratio of 33%, also used to compute the virtual balance
      batchBlocks:      '1',                                                // Market maker batch size
      slippage:         '100000000000000000'                                // TODO
    }
  },
  ropsten: {
    infra: {
      ens:              undefined,                                          // Ropsten ENS instance
      daoFactory:       undefined,                                          // DAO factory used for the templates in Ropsten
      registrar:        undefined                                           // Ropsten aragonID
    },
    instance: {
      openDate:         Math.floor(new Date() / 1000 + 600).toString(),     // Presale will start in 10 minutes from now
      period:           '86400',                                            // Presale period will last 1 day, bonding curve will start right after that
      exchangeRate:     '100000000',                                        // Presale exchange rate 1 ANT = 100 ANJ
      beneficiaryPct:   '200000',                                           // 20% of the generated ANJ will be minted for the owner
      reserveRatio:     '33333',                                            // Bonding curve reserve ratio of 33%, also used to compute the virtual balance
      batchBlocks:      '1',                                                // Market maker batch size
      slippage:         '100000000000000000'                                // TODO
    }
  },
  rpc: {
    infra: {
      ens:              '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1',       // Aragen ENS instance
      daoFactory:       '0x5d94e3e7aec542ab0f9129b9a7badeb5b3ca0f77',       // DAO factory used for the templates in Aragen
      registrar:        '0xf1f8aac64036cdd399886b1c157b7e3b361093f3'        // Aragen aragonID
    },
    instance: {
      openDate:         Math.floor(new Date() / 1000 + 600).toString(),     // Presale will start in 10 minutes from now
      period:           '600',                                              // Presale period will last 10 minutes, bonding curve will start right after that
      exchangeRate:     '100000000',                                        // Presale exchange rate 1 ANT = 100 ANJ
      beneficiaryPct:   '200000',                                           // 20% of the generated ANJ will be minted for the owner
      reserveRatio:     '33333',                                            // Bonding curve reserve ratio of 33%, also used to compute the virtual balance
      batchBlocks:      '1',                                                // Market maker batch size
      slippage:         '100000000000000000'                                // 10%
    },
  },
}

Object.keys(environments).forEach(network => {
  environments[network].governor = governor[network]
  environments[network].instance.id = 'templates-externally-owned-presale-bonding-curve'
  environments[network].instance.bondedToken = requireOutput(`minime.${network}`, getAddressIfDefined('ANJ'))
  environments[network].instance.collateralToken = requireOutput(`minime.${network}`, getAddressIfDefined('ANT'))
})

module.exports = environments

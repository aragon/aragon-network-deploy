// 2020, Jan 7th 16.00 UTC
const PRESALE_START_DATE = Math.floor(new Date('2020-01-07T16:00:00.000Z') / 1000).toString()

// 2020, Feb 10th 00.00 UTC
const BONDING_START_DATE = Math.floor(new Date('2020-02-10T00:00:00.000Z') / 1000).toString()
const PRESALE_PERIOD = BONDING_START_DATE - PRESALE_START_DATE

module.exports = {
  infra: {
    ens:              '0x314159265dd8dbb310642f98f50c066173c1259b',       // Mainnet ENS instance
    daoFactory:       '0xb9da44c051c6cc9e04b7e0f95e95d69c6a6d8031',       // DAO factory used for the templates in Mainnet
    registrar:        '0x546aa2eae2514494eeadb7bbb35243348983c59d'        // Mainnet aragonID
  },
  instance: {
    owner:            '0x5e8c17a6065c35b172b10e80493d2266e2947df4',       // Agent of AN DAO
    id:               'templates-externally-owned-presale-bonding-curve', // ID of the template to be registered in aragon ID
    collateralToken:  '0x960b236A07cf122663c4303350609A66A7B288C0',       // ANT
    bondedToken:      '0xcD62b1C403fa761BAadFC74C525ce2B51780b184',       // ANJ
    period:           PRESALE_PERIOD,                                     // Diff in seconds between court start date (Feb 10th) and presale start date
    exchangeRate:     '100000000',                                        // Presale exchange rate 1 ANT = 100 ANJ (PPM)
    openDate:         PRESALE_START_DATE,                                 // Presale start on Jan 7th 2020 4pm UTC
    beneficiaryPct:   '100000',                                           // 10% of the generated ANJ will be minted for the owner
    reserveRatio:     '250000',                                           // Bonding curve reserve ratio of 25% (PPM), also used to compute the virtual balance
    batchBlocks:      '1',                                                // Market maker batch size
    slippage:         '100000000000000000'                                // 10% (PPM)
  },
  aragonNetworkDAO: {
    votingApp:        '0x240b4de6000b4ad52ceaa1057c2647bfc24ce697',       // Voting of AN DAO
    tokenManager:     '0xda15e525b09266488c95c2742e849ca71683a0f5',       // Token Manager of AN DAO
  },
  wrapper: {
    registry:         '0x8bEa04A94aEc27CE8C2409b0e0F28A02996d264d',       // Court's Jurors Registry instance on Mainnet
    presale:          '0xf89c8752d82972f94a4D1331e010eD6593e8EC49'        // Fundraising presale instance on Mainnet
  }
}

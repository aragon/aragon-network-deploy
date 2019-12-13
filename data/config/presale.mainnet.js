// 2020, Jan 7th 16.00 UTC
const OPEN_DATE = Math.floor(new Date('2020-01-7T16:00:00.000Z') / 1000).toString()

module.exports = {
  infra: {
    ens:              '0x314159265dd8dbb310642f98f50c066173c1259b',   // Mainnet ENS instance
    daoFactory:       '0xb9da44c051c6cc9e04b7e0f95e95d69c6a6d8031',   // DAO factory used for the templates in Mainnet
    registrar:        '0x546aa2eae2514494eeadb7bbb35243348983c59d'    // Mainnet aragonID
  },
  instance: {
    owner:            '0x5e8c17a6065c35b172b10e80493d2266e2947df4',   // Agent of AN DAO
    id:               '',                                             // TODO: set variable or explain why it can be leave like this
    collateralToken:  '0x960b236A07cf122663c4303350609A66A7B288C0',   // ANT
    bondedToken:      '0xcD62b1C403fa761BAadFC74C525ce2B51780b184',   // ANJ
    period:           '',                                             // TODO: set variable or explain why it can be leave like this
    exchangeRate:     '100000000',                                    // For presale: 1/100
    openDate:         OPEN_DATE,                                      // Presale start, Jan 7th 2020 4pm UTC
    reserveRatio:     '33333',                                        // 33%
    batchBlocks:      '1',                                            // Market maker batch size
    slippage:         '100000000000000000'                            // 10%
  },
  aragonNetworkDAO: {
    votingApp:        '0x240b4de6000b4ad52ceaa1057c2647bfc24ce697',   // Voting of AN DAO
    tokenManager:     '0xda15e525b09266488c95c2742e849ca71683a0f5',   // Token Manager of AN DAO
    voteDescription:  'Change ANJ controller to template and deploy new presale and bonding curve instance'
  }
}

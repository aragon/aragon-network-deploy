const START_DATE = Math.floor(new Date() / 1000 + 600).toString()         // 10 minutes from now

module.exports = {
  infra: {
    ens:              '0xfe03625ea880a8cba336f9b5ad6e15b0a3b5a939',       // Staging ENS instance
    daoFactory:       '0xf959e8953e2fe03782a7b86a7a5d948cb511ef5d',       // DAO factory used for the templates in Staging
    registrar:        '0xa2e76aa249e3f52ea94c175662adadf27185484a'        // Staging aragonID
  },
  instance: {
    owner:            '0xde8bf81d4a8b67f51dc909035cca5b4e14e92d88',       // Agent of AN DAO Staging (short)
    id:               'templates-eopbc-1',                                // ID of the template to be registered in aragon ID
    collateralToken:  '0xd6257606740DE4A457B97D5DD469021ED72b6Ae7',       // ANT
    bondedToken:      '0x46D5708A670d1d1163BD037cc15Bca74f9665A13',       // ANJ
    period:           '86400',                                            // Presale period will last 1 day, bonding curve will start right after that
    exchangeRate:     '100000000',                                        // Presale exchange rate 1 ANT = 100 ANJ
    openDate:         START_DATE,                                         // Presale will start in 10 minutes from now
    beneficiaryPct:   '200000',                                           // 20% of the generated ANJ will be minted for the owner
    reserveRatio:     '33333',                                            // Bonding curve reserve ratio of 33%, also used to compute the virtual balance
    batchBlocks:      '1',                                                // Market maker batch size
    slippage:         '100000000000000000'                                // TODO
  },
  aragonNetworkDAO: {
    votingApp:        '0xaad2ccf51b42ea7f27948c38b4f7afd8174ef217',       // Voting of AN DAO Staging (short)
    tokenManager:     '0x08d25ce71579c2b97b688bc8a7d0b35b92504ec3',       // Token Manager of AN DAO Staging (short)
  },
  wrapper: {
    registry:         '0x2D6E7941c41be354C4D6ba56842Abce6F739a52d',       // Court's Jurors Registry instance on Staging
    presale:          '0x2319330c6d98cCC0Acc78FE172aFa00D8C0a4383'        // Fundraising presale instance on Staging
  }
}

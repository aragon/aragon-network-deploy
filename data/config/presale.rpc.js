const START_DATE = Math.floor(new Date() / 1000 + 600).toString()         // 10 minutes from now

module.exports = {
  infra: {
    ens:              '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1',       // Aragen ENS instance
    daoFactory:       '0x5d94e3e7aec542ab0f9129b9a7badeb5b3ca0f77',       // DAO factory used for the templates in Aragen
    registrar:        '0xf1f8aac64036cdd399886b1c157b7e3b361093f3'        // Aragen aragonID
  },
  instance: {
    owner:            undefined,                                          // Set with an AN DAO deployed to Aragen
    id:               'templates-externally-owned-presale-bonding-curve', // ID of the template to be registered in aragon ID
    collateralToken:  undefined,                                          // Set with the ANT instance deployed to Aragen
    bondedToken:      undefined,                                          // Set with the ANJ instance deployed to Aragen
    period:           '600',                                              // Presale period will last 10 minutes, bonding curve will start right after that
    exchangeRate:     '100000000',                                        // Presale exchange rate 1 ANT = 100 ANJ
    openDate:         START_DATE,                                         // Presale will start in 10 minutes from now
    beneficiaryPct:   '200000',                                           // 20% of the generated ANJ will be minted for the owner
    reserveRatio:     '33333',                                            // Bonding curve reserve ratio of 33%, also used to compute the virtual balance
    batchBlocks:      '1',                                                // Market maker batch size
    slippage:         '100000000000000000'                                // 10%
  },
  aragonNetworkDAO: {
    votingApp:        undefined,                                          // Set with the voting app of the AN DAO deployed to Aragen
    tokenManager:     undefined,                                          // Set with the token manager of the AN DAO deployed to Aragen
  },
  wrapper: {
    registry:         '0x4eD6178D5dEf6AFD8e23334038609125cBB15C8F',       // Court's Jurors Registry instance on Aragen
    presale:          '0x1902a0410EFe699487Dd85F12321aD672bE4ada2'        // Fundraising presale instance on Aragen
  }
}

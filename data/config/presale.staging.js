// 2 minutes from now
const OPEN_DATE = Math.floor(new Date() / 1000 + 120).toString()

module.exports = {
  infra: {
    ens:              '0xfe03625ea880a8cba336f9b5ad6e15b0a3b5a939',   // Staging ENS instance
    daoFactory:       '0xf959e8953e2fe03782a7b86a7a5d948cb511ef5d',   // DAO factory used for the templates in Staging
    registrar:        '0xa2e76aa249e3f52ea94c175662adadf27185484a'    // Staging aragonID
  },
  instance: {
    owner:            '0xde8bf81d4a8b67f51dc909035cca5b4e14e92d88',   // Agent of AN DAO Staging
    id:               'anj-presale-short',                            // TODO: clarify
    collateralToken:  '0xF68eb8077744b49F2B289c0Fd12Bbc9f3729dFe3',   // ANT
    bondedToken:      '0x72e751147A2947E2018a6Df22889600873C29021',   // ANJ
    period:           '86400',                                        // Presale duration, 1 day TODO: isn't this too low?
    exchangeRate:     '100000000',                                    // For presale: 1/100
    openDate:         OPEN_DATE,                                      // Presale start, 2 minutes from now
    reserveRatio:     '33333',                                        // 33%
    batchBlocks:      '1',                                            // Market maker batch size
    slippage:         '100000000000000000'                            // 10%
  },
  aragonNetworkDAO: {
    votingApp:        '0xaad2ccf51b42ea7f27948c38b4f7afd8174ef217',   // Voting of AN DAO Staging
    tokenManager:     '0x08d25ce71579c2b97b688bc8a7d0b35b92504ec3',   // Token Manager of AN DAO Staging
    voteDescription:  'Change ANJ controller to template and deploy new presale and bonding curve instance'
  }
}

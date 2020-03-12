const rpc = {
  agent:            undefined,                                          // Set with the agent app of the AN DAO deployed to Aragen
  votingApp:        undefined,                                          // Set with the voting app of the AN DAO deployed to Aragen
  tokenManager:     undefined,                                          // Set with the token manager of the AN DAO deployed to Aragen
}

const ropsten = {
  agent:            undefined,
  votingApp:        undefined,
  tokenManager:     undefined,
}

const staging = {
  agent:            '0xec5700f0774cc9e7f2d89bee4b14401124fc2d06',        // Agent of AN DAO Staging (short)
  votingApp:        '0xaad2ccf51b42ea7f27948c38b4f7afd8174ef217',       // Voting of AN DAO Staging (short)
  tokenManager:     '0x08d25ce71579c2b97b688bc8a7d0b35b92504ec3',       // Token Manager of AN DAO Staging (short)
}

const rinkeby = {
  agent:            '0x9aedfbe0f3ed33cbb71f937cb9eb0ff1f4dfc076',       // Agent of AN DAO Rinkeby
  votingApp:        '0xb0c839957bc47541d747e5238c06990e3a41c2a3',       // Voting of AN DAO Rinkeby
  tokenManager:     '0x0cc31e2d5117d25fe50ee9d569613851e6bb0dd9',       // Token Manager of AN DAO Rinkeby
}

const mainnet = {
  agent:            '0x5e8c17a6065c35b172b10e80493d2266e2947df4',       // Agent of AN DAO
  votingApp:        '0x240b4de6000b4ad52ceaa1057c2647bfc24ce697',       // Voting of AN DAO
  tokenManager:     '0xda15e525b09266488c95c2742e849ca71683a0f5',       // Token Manager of AN DAO
}

module.exports = {
  rpc,
  ropsten,
  staging,
  rinkeby,
  mainnet
}

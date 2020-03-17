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
  agent:            '0xec5700f0774cc9e7f2d89bee4b14401124fc2d06',       // Agent of AN DAO Staging
  votingApp:        '0x5505f0db0ff6990459e812e19bf7895148c6a8b3',       // Voting of AN DAO Staging
  tokenManager:     '0x2cedb6250da2e4798f742eb60b075c8f4ef5ef6a',       // Token Manager of AN DAO Staging
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

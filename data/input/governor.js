const governor = require('../../src/models/shared/Governor')

const rpc =     governor('0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1')    // Ganache first deterministic
const aragen =  governor('0xb4124cEB3451635DAcedd11767f004d8a28c6eE7')    // Aragon first deterministic address
const ropsten = governor('0x0090aED150056316E37FE6DFa10Dc63E79D173B6')    // EOA

const staging = governor({ // https://aragon.staging.aragonpm.com/#/andaostaging
  agent:        '0xec5700f0774cc9e7f2d89bee4b14401124fc2d06',             // Agent of AN DAO Staging
  voting:       '0x5505f0db0ff6990459e812e19bf7895148c6a8b3',             // Voting of AN DAO Staging
  tokenManager: '0x2cedb6250da2e4798f742eb60b075c8f4ef5ef6a',             // Token Manager of AN DAO Staging
})

const rinkeby = governor({ // https://rinkeby.aragon.org/#/andao
  agent:        '0x9aedfbe0f3ed33cbb71f937cb9eb0ff1f4dfc076',             // Agent of AN DAO Rinkeby
  voting:       '0xb0c839957bc47541d747e5238c06990e3a41c2a3',             // Voting of AN DAO Rinkeby
  tokenManager: '0x0cc31e2d5117d25fe50ee9d569613851e6bb0dd9',             // Token Manager of AN DAO Rinkeby
})

const mainnet = governor({ // https://mainnet.aragon.org/#/network
  agent:        '0x5e8c17a6065c35b172b10e80493d2266e2947df4',             // Agent of AN DAO
  voting:       '0x240b4de6000b4ad52ceaa1057c2647bfc24ce697',             // Voting of AN DAO
  tokenManager: '0xda15e525b09266488c95c2742e849ca71683a0f5',             // Token Manager of AN DAO
})

module.exports = {
  rpc,
  ropsten,
  staging,
  rinkeby,
  mainnet
}

const governor = require('../../src/models/shared/Governor')

const rpc =     governor('0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1')    // Ganache first deterministic
const aragen =  governor('0xb4124cEB3451635DAcedd11767f004d8a28c6eE7')    // Aragon first deterministic address
const ropsten = governor('0x0090aED150056316E37FE6DFa10Dc63E79D173B6')    // EOA

const staging = governor({ // https://rinkeby.aragon.org/#/andaostaging
  agent:        '0x360c7fe659cc342966d162688d3b2b0417746d1d',             // Agent of AN DAO Staging
  voting:       '0xd52c9b839bf364105044aab23f5b18641e8dd15c',             // Voting of AN DAO Staging
  tokenManager: '0x22bf27749a04b437ab0dd4feaab184913ba4e3fa',             // Token Manager of AN DAO Staging
})

const rinkeby = governor({ // https://rinkeby.client.aragon.org/#/andaocouncil/
  agent:        '0x5ef7ec1a0b4f162e5a4971822c5e4a90766026b7',             // Agent of AN DAO Rinkeby
  voting:       '0x2acb30fa47af2e3d4c6ba3a8d2e0563fca98b252',             // Voting of AN DAO Rinkeby
  tokenManager: '0x544c07c27b1fefbb97092b4f471b8eb8328bee88',             // Token Manager of AN DAO Rinkeby
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

const { mainnet: { agent } } = require('./ANDAO')

module.exports = {
  owner:            agent,                                              // Agent of AN DAO
  bondedToken:      '0xcD62b1C403fa761BAadFC74C525ce2B51780b184',       // ANJ
  registry:         '0x0F7471C1df2021fF45f112878F755aAbe7AA16bF',       // Court's Jurors Registry instance
  uniswap:          '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95',       // Uniswap Factory address
}

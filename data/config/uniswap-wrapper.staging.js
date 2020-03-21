const { mainnet: { agent } } = require('./ANDAO')

module.exports = {
  owner:            agent,                                              // Agent of AN DAO Staging (short)
  bondedToken:      '0xae83b8A9983b934Ebed4167BfDC4170d2A1E3D76',       // ANJ
  registry:         '0x3497b2F7eEB7f1BeEFb044c6DA90110C4D6d5C4E',       // Court's Jurors Registry instance
  uniswap:          '0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36',       // Uniswap Factory address
}

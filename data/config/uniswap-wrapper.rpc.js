const { rpc: { agent } } = require('./ANDAO')

module.exports = {
  owner:            agent,           // Agent of AN DAO
  bondedToken:      undefined,       // ANJ
  registry:         undefined,       // Court's Jurors Registry instance
  uniswap:          undefined,       // Uniswap Factory address
}

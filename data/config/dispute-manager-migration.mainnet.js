const { court: { address: court } } = require('../output/court.mainnet')
const { mainnet: { agent: owner, tokenManager, voting } } = require('./ANDAO')

module.exports = {
  court,
  owner,
  aragonNetworkDAO: {
    voting,
    tokenManager,
  },
  newDisputeManager: '0xf4d2c04D4FE5B19E7adA331ef5450A99a593fEC9'
}

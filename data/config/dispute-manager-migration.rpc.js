const { court: { address: court } } = require('../output/court.rpc')
const { rpc: { agent: owner, tokenManager, voting } } = require('./ANDAO')

module.exports = {
  court,
  owner,
  aragonNetworkDAO: {
    voting,
    tokenManager,
  },
  newDisputeManager: undefined
}

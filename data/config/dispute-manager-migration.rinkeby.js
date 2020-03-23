const { court: { address: court } } = require('../output/court.rinkeby')
const { rinkeby: { agent: owner, tokenManager, voting } } = require('./ANDAO')

module.exports = {
  court,
  owner,
  aragonNetworkDAO: {
    voting,
    tokenManager,
  },
  newDisputeManager: '0x240C2e510Db43867BD868Cc56060084b7f7b769d'
}

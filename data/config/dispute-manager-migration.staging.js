const { court: { address: court } } = require('../output/court.staging')
const { staging: { agent: owner, tokenManager, voting } } = require('./ANDAO')

module.exports = {
  court,
  owner,
  aragonNetworkDAO: {
    voting,
    tokenManager,
  },
  newDisputeManager: '0x6F81524ba56feAF2004D0896ff6E4b557e9De1e9'
}

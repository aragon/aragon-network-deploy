const { court: { address: court } } = require('../output/court.usability')
const { usability: { agent: owner, tokenManager, voting } } = require('./ANDAO')

module.exports = {
  court,
  owner,
  aragonNetworkDAO: {
    voting,
    tokenManager,
  },
  newDisputeManager: '0x4fCb772042b935BD7D510350c14B44e0BbBaB836'
}

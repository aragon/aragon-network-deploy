const environments = require('./court')

Object.keys(environments).map(network => {
  const { court, disputes, subscriptions, voting, treasury, registry } = require(`../output/court.${network}`)
  environments[network].modules = {
    court: court.address,
    voting: voting.address,
    treasury: treasury.address,
    subscriptions: subscriptions.address,
    disputeManager: disputes.address,
    jurorsRegistry: registry.address,
  }
})

module.exports = environments
